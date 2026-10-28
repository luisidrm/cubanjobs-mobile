import { useRouter } from "expo-router";
import { Search, SearchX, SlidersHorizontal, WifiOff } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, View } from "react-native";
import { useGetTagsQuery, useSearchJobsQuery } from "../../../store/api/jobsApi";
import { useGetMySavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } from "../../../store/api/savedJobsApi";
import { EmptyState, Icon, NavBar, Screen, CardSkeletons, Text, TextField, VerifyBanner } from "../../components/ds";
import { JobCard } from "../../components/Jobs/JobCard";
import { PlanBanner } from "../../components/plans/PlanBanner";
import { NotificationBell } from "../../components/notifications/NotificationBell";
import { FilterChip } from "../../components/tabs/FilterChip";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import type { Currency, JobSearchFilters } from "../../types/job";

type ChipKey = "remote" | "CUP" | "MLC" | "USD" | "fullTime";

export default function ExploreScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<ChipKey>>(new Set());
  const [activeTagIds, setActiveTagIds] = useState<Set<string>>(new Set());

  const { data: tags } = useGetTagsQuery();

  const toggleChip = (key: ChipKey) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        // currency chips are mutually exclusive with each other
        if (key === "CUP" || key === "MLC" || key === "USD") {
          next.delete("CUP");
          next.delete("MLC");
          next.delete("USD");
        }
        next.add(key);
      }
      return next;
    });
  };

  const toggleTag = (tagId: string) => {
    setActiveTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) {
        next.delete(tagId);
      } else {
        next.add(tagId);
      }
      return next;
    });
  };

  const filters = useMemo<JobSearchFilters>(() => {
    const f: JobSearchFilters = { limit: 20, offset: 0 };
    if (query.trim()) f.q = query.trim();
    if (active.has("remote")) f.isRemote = true;
    if (active.has("fullTime")) f.jobType = "full_time";
    const currency = (["CUP", "MLC", "USD"] as ChipKey[]).find((c) => active.has(c));
    if (currency) f.currency = currency as Currency;
    if (activeTagIds.size > 0) f.tagIds = Array.from(activeTagIds).join(",");
    return f;
  }, [query, active, activeTagIds]);

  const { data: jobs, isLoading, isError, refetch } = useSearchJobsQuery(filters);

  const { data: savedJobs } = useGetMySavedJobsQuery();
  const savedJobIds = useMemo(() => new Set(savedJobs?.map((s) => s.jobId)), [savedJobs]);
  const [saveJob] = useSaveJobMutation();
  const [unsaveJob] = useUnsaveJobMutation();

  return (
    <Screen safeTop={false}>
      <NavBar
        large
        title={t("tabs.explore")}
        subtitle={t("explore.opportunitiesNear", { count: jobs?.length ?? 0 })}
        trailing={<NotificationBell />}
      />

      <FlatList showsVerticalScrollIndicator={false}
        data={jobs ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: TAB_BAR_CLEARANCE }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 12 }}>
            <VerifyBanner />
            <PlanBanner />

            <TextField
              value={query}
              onChangeText={setQuery}
              icon={Search}
              placeholder={t("explore.searchPlaceholder")}
              returnKeyType="search"
              trailing={<Icon icon={SlidersHorizontal} size={18} color={p.text3} />}
            />

            <ScrollView showsVerticalScrollIndicator={false}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, marginHorizontal: -16 }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {(
                [
                  { key: "remote", label: t("explore.remote") },
                  { key: "CUP", label: "CUP" },
                  { key: "MLC", label: "MLC" },
                  { key: "USD", label: "USD" },
                  { key: "fullTime", label: t("explore.fullTime") },
                ] as { key: ChipKey; label: string }[]
              ).map((item) => (
                <FilterChip
                  key={item.key}
                  label={item.label}
                  active={active.has(item.key)}
                  onPress={() => toggleChip(item.key)}
                />
              ))}
              {tags?.map((tag) => (
                <FilterChip
                  key={tag.id}
                  label={tag.name}
                  active={activeTagIds.has(tag.id)}
                  onPress={() => toggleTag(tag.id)}
                />
              ))}
            </ScrollView>

            <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 4, paddingTop: 4 }}>
              {t("explore.latest")}
            </Text>
            {isLoading ? <CardSkeletons /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => router.push({ pathname: "/job/[id]", params: { id: item.id } })}
            isSaved={savedJobIds.has(item.id)}
            onToggleSave={() => (savedJobIds.has(item.id) ? unsaveJob(item.id) : saveJob(item.id))}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : isError ? (
            <EmptyState icon={WifiOff} tone="danger" message={t("explore.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
          ) : (
            <EmptyState
              icon={SearchX}
              message={t("explore.empty")}
              actionLabel={t("explore.clearFilters")}
              onAction={() => {
                setQuery("");
                setActive(new Set());
                setActiveTagIds(new Set());
              }}
            />
          )
        }
        onRefresh={refetch}
        refreshing={false}
      />
    </Screen>
  );
}
