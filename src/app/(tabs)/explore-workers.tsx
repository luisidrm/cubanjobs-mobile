import { useRouter } from "expo-router";
import { Lock, Search, SearchX, WifiOff } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ScrollView, View } from "react-native";
import { useGetMyCompaniesQuery } from "../../../store/api/companiesApi";
import { useGetWorkerSkillsQuery, useSearchWorkersQuery } from "../../../store/api/usersApi";
import { CardSkeletons, EmptyState, NavBar, Screen, TextField } from "../../components/ds";
import { WorkerCard } from "../../components/Jobs/WorkerCard";
import { FilterChip } from "../../components/tabs/FilterChip";
import { hasCandidateSearchAccess } from "../../lib/plans";
import { useSkillLabel } from "../../lib/skills";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";
import type { WorkerSearchFilters } from "../../types/user";

export default function ExploreWorkersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeSkills, setActiveSkills] = useState<Set<string>>(new Set());

  const { data: companies, isLoading: companyLoading } = useGetMyCompaniesQuery();
  const company = companies?.[0];
  const hasAccess = !!company && hasCandidateSearchAccess(company.planTier);

  const { data: skillsList } = useGetWorkerSkillsQuery(undefined, { skip: !hasAccess });
  const skillLabel = useSkillLabel();

  const toggleSkill = (skill: string) => {
    setActiveSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const filters = useMemo<WorkerSearchFilters>(() => {
    const f: WorkerSearchFilters = { limit: 20, offset: 0 };
    if (query.trim()) f.q = query.trim();
    if (activeSkills.size > 0) f.skills = Array.from(activeSkills).join(",");
    return f;
  }, [query, activeSkills]);

  const { data: workers, isLoading, isError, refetch } = useSearchWorkersQuery(filters, { skip: !hasAccess });

  if (!companyLoading && !hasAccess) {
    return (
      <Screen safeTop={false}>
        <NavBar large title={t("exploreWorkers.title")} />
        <EmptyState
          icon={Lock}
          message={`${t("exploreWorkers.upgradeTitle")}. ${t("exploreWorkers.upgradeMessage")}`}
          actionLabel={t("exploreWorkers.upgradeButton")}
          onAction={() => router.push("/billing")}
        />
      </Screen>
    );
  }

  return (
    <Screen safeTop={false}>
      <NavBar large title={t("exploreWorkers.title")} subtitle={t("exploreWorkers.subtitle")} />

      <FlatList showsVerticalScrollIndicator={false}
        data={workers ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: TAB_BAR_CLEARANCE }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={{ gap: 16, paddingBottom: 12 }}>
            <TextField
              value={query}
              onChangeText={setQuery}
              icon={Search}
              placeholder={t("exploreWorkers.searchPlaceholder")}
              returnKeyType="search"
            />

            {skillsList && skillsList.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0, marginHorizontal: -16 }}
                contentContainerStyle={{ paddingHorizontal: 16 }}
              >
                {skillsList.map((skill) => (
                  <FilterChip
                    key={skill}
                    label={skillLabel(skill)}
                    active={activeSkills.has(skill)}
                    onPress={() => toggleSkill(skill)}
                  />
                ))}
              </ScrollView>
            ) : null}
            {isLoading ? <CardSkeletons /> : null}
          </View>
        }
        renderItem={({ item }) => (
          <WorkerCard
            worker={item}
            onPress={() => router.push({ pathname: "/applicant-profile", params: { userId: item.id } })}
          />
        )}
        ListEmptyComponent={
          isLoading ? null : isError ? (
            <EmptyState icon={WifiOff} tone="danger" message={t("exploreWorkers.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
          ) : (
            <EmptyState icon={SearchX} message={t("exploreWorkers.empty")} actionLabel={t("explore.clearFilters")} onAction={() => { setQuery(""); setActiveSkills(new Set()); }} />
          )
        }
        onRefresh={refetch}
        refreshing={false}
      />
    </Screen>
  );
}
