import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useGetMyCompaniesQuery } from "../../../store/api/companiesApi";
import { useGetJobsByCompanyQuery } from "../../../store/api/jobsApi";
import { colors } from "../../theme/colors";
import type { EmployerJob, JobStatus } from "../../types/job";

const STATUS_STYLE: Record<JobStatus, { bg: string; text: string }> = {
  draft: { bg: "#EEEEF0", text: "#6B6B70" },
  active: { bg: "#E1F5E6", text: "#1E8A3C" },
  closed: { bg: "#FBE3E3", text: "#C43E3E" },
  expired: { bg: "#FCEBCB", text: "#B8760B" },
};

function JobStatusPill({ status }: { status: JobStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status];
  return (
    <View style={[styles.statusPill, { backgroundColor: style.bg }]}>
      <Text style={[styles.statusText, { color: style.text }]}>{t(`jobStatus.${status}`)}</Text>
    </View>
  );
}

function MyJobRow({ job, onPress, onEdit }: { job: EmployerJob; onPress: () => void; onEdit: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle} numberOfLines={1}>{job.title}</Text>
          <Text style={styles.cardMeta}>{job.viewCount} views</Text>
        </View>
        <JobStatusPill status={job.status} />
      </View>
      <View style={styles.cardFooter}>
        <Pressable style={styles.editButton} onPress={onEdit} hitSlop={8}>
          <Ionicons name="pencil-outline" size={14} color={colors.textPrimary} />
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function MyJobsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: companies, isLoading: companiesLoading } = useGetMyCompaniesQuery();
  const company = companies?.[0];

  const {
    data: jobs,
    isLoading: jobsLoading,
  } = useGetJobsByCompanyQuery(company?.id ?? "", { skip: !company });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={styles.headerTitle}>{t("tabs.myJobs")}</Text>
        </View>
        <View style={styles.headerActions}>
          {company && (
            <Pressable onPress={() => router.push("/job-form")} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={26} color={colors.textPrimary} />
            </Pressable>
          )}
          <Pressable onPress={() => router.push("/(tabs)/profile")}>
            <Ionicons name="person-circle-outline" size={30} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      {companiesLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {!companiesLoading && !company && (
        <View style={styles.centered}>
          <Ionicons name="business-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{t("myJobs.noCompanyTitle")}</Text>
          <Text style={styles.emptySubtitle}>{t("myJobs.noCompanySubtitle")}</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/company-profile")}>
            <Text style={styles.primaryButtonText}>{t("myJobs.createCompany")}</Text>
          </Pressable>
        </View>
      )}

      {company && (
        <FlatList
          data={jobs ?? []}
          keyExtractor={(j) => j.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <MyJobRow
              job={item}
              onPress={() => router.push({ pathname: "/job-applicants", params: { jobId: item.id } })}
              onEdit={() => router.push({ pathname: "/job-form", params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            !jobsLoading ? (
              <View style={styles.centered}>
                <Text style={styles.emptySubtitle}>{t("myJobs.noJobs")}</Text>
                <Pressable style={styles.primaryButton} onPress={() => router.push("/job-form")}>
                  <Text style={styles.primaryButtonText}>{t("myJobs.postJob")}</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 16 },
  logoBadge: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.textPrimary,
    alignItems: "center", justifyContent: "center",
  },
  logoLetter: { color: colors.accent, fontWeight: "800", fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32, paddingTop: 60 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
  primaryButton: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12, marginTop: 6 },
  primaryButtonText: { color: colors.surface, fontWeight: "700", fontSize: 14 },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#EEEEF0",
  },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLeft: { flex: 1, marginRight: 12 },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.textPrimary },
  cardMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontWeight: "700", fontSize: 12 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 },
  editButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  editText: { fontWeight: "700", fontSize: 13, color: colors.textPrimary },
});
