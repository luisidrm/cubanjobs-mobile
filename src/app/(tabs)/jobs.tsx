import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useGetEmailVerificationStatusQuery, useResendVerificationEmailMutation } from "../../../store/api/authApi";
import { useSearchJobsQuery } from "../../../store/api/jobsApi";
import { useGetMySavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } from "../../../store/api/savedJobsApi";
import type { RootState } from "../../../store/store";
import { JobCard } from "../../components/Jobs/JobCard";
import { FilterChip } from "../../components/tabs/FilterChip";
import { colors } from "../../theme/colors";
import type { Currency, JobSearchFilters } from "../../types/job";

type ChipKey = "remote" | "CUP" | "MLC" | "USD" | "fullTime";

export default function ExploreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Set<ChipKey>>(new Set());

  const { data: verification } = useGetEmailVerificationStatusQuery();
  const [resendVerificationEmail, { isLoading: resending }] = useResendVerificationEmailMutation();
  const [resent, setResent] = useState(false);

  const activeUser = useSelector((state: RootState) => state.auth);

  console.log("Active user:", activeUser);

  async function handleResend() {
    try {
      await resendVerificationEmail().unwrap();
      setResent(true);
    } catch {
      // Best-effort — user can just tap again.
    }
  }

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

  const filters = useMemo<JobSearchFilters>(() => {
    const f: JobSearchFilters = { limit: 20, offset: 0 };
    if (query.trim()) f.q = query.trim();
    if (active.has("remote")) f.isRemote = true;
    if (active.has("fullTime")) f.jobType = "full_time";
    const currency = (["CUP", "MLC", "USD"] as ChipKey[]).find((c) => active.has(c));
    if (currency) f.currency = currency as Currency;
    return f;
  }, [query, active]);

  const { data: jobs, isLoading, isError, refetch } = useSearchJobsQuery(filters);

  const { data: savedJobs } = useGetMySavedJobsQuery();
  const savedJobIds = useMemo(() => new Set(savedJobs?.map((s) => s.jobId)), [savedJobs]);
  const [saveJob] = useSaveJobMutation();
  const [unsaveJob] = useUnsaveJobMutation();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <View>
            <Text style={styles.brandAccent}>CUBAN</Text>
            <Text style={styles.brandName}>Jobs</Text>
          </View>
        </View>
        <Pressable>   {/*onPress={() => router.push("/(tabs)/notifications")} */}
          <Ionicons name="notifications-outline" size={30} color={colors.textPrimary} />
        </Pressable>
      </View>

      {
      verification?.isVerified === false && (
        <View style={styles.verifyBanner}>
          <Ionicons name="mail-unread-outline" size={20} color={colors.accent} />
          <View style={styles.verifyBannerText}>
            <Text style={styles.verifyBannerTitle}>{t("verifyBanner.title")}</Text>
            <Text style={styles.verifyBannerSubtitle}>{t("verifyBanner.subtitle")}</Text>
          </View>
          <Pressable onPress={handleResend} disabled={resending || resent}>
            <Text style={styles.verifyBannerAction}>
              {resent ? t("verifyBanner.resent") : t("verifyBanner.resend")}
            </Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={jobs ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <Text style={styles.greeting}>✨ {t("explore.greeting")}</Text>
            <View style={styles.headlineRow}>
              <View style={styles.headlineText}>
                <Text style={styles.headline}>{t("explore.headline")}</Text>
                <Text style={[styles.headline, styles.headlineMuted]}>
                  {t("explore.headlineAccent")}
                </Text>
              </View>
              <Text style={styles.opportunitiesCount}>
                {t("explore.opportunitiesNear", { count: jobs?.length ?? 0 })}
              </Text>
            </View>

            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t("explore.searchPlaceholder") as string}
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
              />
              <Ionicons name="options-outline" size={20} color={colors.textMuted} />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsRow}
              contentContainerStyle={styles.chipsRowContent}
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
            </ScrollView>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t("explore.latest")}</Text>
              <Text style={styles.sectionBadge}>{t("explore.justIn")}</Text>
            </View>
          </>
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
          !isLoading ? (
            <Text style={styles.emptyText}>
              {isError ? t("explore.error") : t("explore.empty")}
            </Text>
          ) : null
        }
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: { color: colors.accent, fontWeight: "800", fontSize: 16 },
  brandAccent: { color: colors.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  brandName: { color: colors.textPrimary, fontSize: 16, fontWeight: "800" },
  verifyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.accentSoft,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
  },
  verifyBannerText: { flex: 1 },
  verifyBannerTitle: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  verifyBannerSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  verifyBannerAction: { fontSize: 13, fontWeight: "700", color: colors.accent },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  greeting: { color: colors.accent, fontWeight: "700", fontSize: 13, marginTop: 20, letterSpacing: 1 },
  headlineRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 6 },
  headlineText: { flex: 1 },
  headline: { fontSize: 30, fontWeight: "800", color: colors.textPrimary, lineHeight: 34 },
  headlineMuted: { color: "#B9B9BE" },
  opportunitiesCount: { color: colors.textSecondary, fontWeight: "600", fontSize: 13, textAlign: "right", width: 110 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 20,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.textPrimary },
  chipsRow: { marginTop: 16, flexGrow: 0 },
  chipsRowContent: { paddingRight: 20 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 26, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  sectionBadge: { fontSize: 12, fontWeight: "700", color: colors.textMuted, letterSpacing: 1 },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: 40, fontSize: 14 },
});