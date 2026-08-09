import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useGetJobByIdQuery } from "../../../store/api/jobsApi";
import { useApplyToJobMutation, useGetMyApplicationsQuery } from "../../../store/api/applicationApi";
import { useGetMySavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } from "../../../store/api/savedJobsApi";
import { colors } from "../../theme/colors";

function formatSalaryRange(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

function formatPostedAgo(createdAt: string, t: TFunction) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000));
  return days === 0 ? t("jobDetails.postedToday") : t("jobDetails.postedDaysAgo", { count: days });
}

export default function JobDetailsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, isLoading, isError, refetch } = useGetJobByIdQuery(id);
  const { data: myApplications } = useGetMyApplicationsQuery();
  const [applyToJob, { isLoading: applying }] = useApplyToJobMutation();
  const { data: savedJobs } = useGetMySavedJobsQuery();
  const [saveJob] = useSaveJobMutation();
  const [unsaveJob] = useUnsaveJobMutation();

  const hasApplied = myApplications?.some(
    (a) => a.job.id === id && a.status !== "withdrawn"
  );
  const isSaved = savedJobs?.some((s) => s.jobId === id) ?? false;

  function handleApply() {
    Alert.alert(
      t("jobDetails.confirmApplyTitle"),
      t("jobDetails.confirmApplyMessage"),
      [
        { text: t("jobDetails.cancel"), style: "cancel" },
        {
          text: t("jobDetails.confirm"),
          onPress: async () => {
            try {
              await applyToJob({ jobId: id }).unwrap();
              Alert.alert(t("jobDetails.applySuccessTitle"), t("jobDetails.applySuccessMessage"));
            } catch {
              Alert.alert(t("jobDetails.applyError"));
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("jobDetails.title")}</Text>
        <Pressable
          onPress={() => (isSaved ? unsaveJob(id) : saveJob(id))}
          hitSlop={12}
          style={styles.headerSpacer}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={22}
            color={isSaved ? colors.accent : colors.textPrimary}
          />
        </Pressable>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("jobDetails.error")}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>{t("jobDetails.retry")}</Text>
          </Pressable>
        </View>
      )}

      {job && (
        <>
          <ScrollView contentContainerStyle={styles.body}>
            <View style={styles.statusRow}>
              <View style={styles.activePill}>
                <Text style={styles.activeText}>{t("jobDetails.active")}</Text>
              </View>
              <View style={styles.postedRow}>
                <Ionicons name="time-outline" size={15} color={colors.textMuted} />
                <Text style={styles.postedText}>{formatPostedAgo(job.createdAt, t)}</Text>
              </View>
            </View>

            <Text style={styles.title}>{job.title}</Text>

            {job.company?.name && (
              <Pressable style={styles.companyRow} onPress={() => {}}>
                <Text style={styles.companyText}>{job.company.name}</Text>
                <Ionicons name="open-outline" size={16} color={colors.accent} />
              </Pressable>
            )}

            <View style={styles.infoCard}>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>{t("jobDetails.salary")}</Text>
                <Text style={styles.infoValue}>
                  {formatSalaryRange(job.salaryMin, job.salaryMax) ?? t("jobDetails.salaryNotDisclosed")}
                </Text>
                {job.currency && (
                  <Text style={styles.infoSubtitle}>{t("jobDetails.perMonth", { currency: job.currency })}</Text>
                )}
              </View>
              <View style={styles.divider} />
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>{t("jobDetails.jobType")}</Text>
                <Text style={styles.infoValue}>
                  {job.jobType ? t(`jobType.${job.jobType}`) : "—"}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>{t("jobDetails.location")}</Text>
                <View style={styles.locationValueRow}>
                  <Ionicons name="location" size={13} color={colors.accent} />
                  <Text style={styles.infoValue}>
                    {job.isRemote ? t("jobDetails.remote") : job.location ?? "—"}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>{t("jobDetails.aboutRole")}</Text>
            <Text style={styles.description}>{job.description}</Text>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.applyButton, hasApplied && styles.applyButtonDisabled]}
              onPress={handleApply}
              disabled={hasApplied || applying}>
              {applying ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <>
                  <Text style={styles.applyText}>
                    {hasApplied ? t("jobDetails.alreadyApplied") : t("jobDetails.applyNow")}
                  </Text>
                  {!hasApplied && <Ionicons name="paper-plane" size={17} color={colors.surface} />}
                </>
              )}
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEF0",
    gap: 8,
  },
  headerTitle: { fontSize: 19, fontWeight: "800", color: colors.textPrimary },
  headerSpacer: { width: 26, alignItems: "center" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  retryButton: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  activePill: { backgroundColor: "#DCF5E6", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  activeText: { color: "#1E8A4C", fontWeight: "700", fontSize: 12 },
  postedRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  postedText: { color: colors.textMuted, fontSize: 13 },
  title: { fontSize: 32, fontWeight: "800", color: colors.textPrimary, marginTop: 18, lineHeight: 38 },
  companyRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, alignSelf: "flex-start" },
  companyText: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
    textDecorationLine: "underline",
    textDecorationColor: colors.accent,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEEEF0",
    padding: 18,
    marginTop: 28,
  },
  infoColumn: { flex: 1, gap: 6 },
  divider: { width: 1, backgroundColor: "#EEEEF0", marginHorizontal: 14 },
  infoLabel: { fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontWeight: "800", color: colors.textPrimary },
  infoSubtitle: { fontSize: 12, color: colors.textMuted },
  locationValueRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, marginTop: 32, marginBottom: 14 },
  description: { fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: "#EEEEF0",
  },
  applyButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 20,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  applyButtonDisabled: { backgroundColor: colors.textMuted },
  applyText: { color: colors.surface, fontWeight: "700", fontSize: 16 },
});
