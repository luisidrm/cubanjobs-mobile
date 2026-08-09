import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from "../../../store/api/applicationApi";
import { useGetMySavedJobsQuery, useUnsaveJobMutation } from "../../../store/api/savedJobsApi";
import { JobCard } from "../../components/Jobs/JobCard";
import { ApplicationCard } from "../../components/application/ApplicationCard";
import { SegmentedControl } from "../../components/application/SegmentedControl";
import { colors } from "../../theme/colors";

export default function ActivityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<"applications" | "saved">("applications");

  const {
    data: applications,
    isLoading: appsLoading,
  } = useGetMyApplicationsQuery(undefined, { skip: tab !== "applications" });
  const [withdrawApplication] = useWithdrawApplicationMutation();

  const {
    data: savedJobs,
    isLoading: savedLoading,
  } = useGetMySavedJobsQuery(undefined, { skip: tab !== "saved" });
  const [unsaveJob] = useUnsaveJobMutation();

  function handleWithdraw(applicationId: string) {
    Alert.alert(
      t("activity.confirmWithdrawTitle"),
      t("activity.confirmWithdrawMessage"),
      [
        { text: t("jobDetails.cancel"), style: "cancel" },
        { text: t("activity.withdraw"), style: "destructive", onPress: () => withdrawApplication(applicationId) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={styles.headerTitle}>{t("tabs.activity")}</Text>
        </View>
        <Pressable onPress={() => router.push("/profile")}>
          <Ionicons name="person-circle-outline" size={30} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <SegmentedControl
          value={tab}
          onChange={(k) => setTab(k as "applications" | "saved")}
          options={[
            { key: "applications", label: "Applications" },
            { key: "saved", label: "Saved jobs" },
          ]}
        />

        {tab === "applications" ? (
          <FlatList
            data={applications ?? []}
            keyExtractor={(a) => a.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Your applications</Text>
                  <Text style={styles.sectionSubtitle}>Track every opportunity in one place.</Text>
                </View>
                <Text style={styles.total}>{applications?.length ?? 0} total</Text>
              </View>
            }
            renderItem={({ item }) => (
              <ApplicationCard
                application={item}
                onPress={() => router.push({ pathname: "/job/[id]", params: { id: item.job.id } })}
                onWithdraw={() => handleWithdraw(item.id)}
              />
            )}
            ListEmptyComponent={
              !appsLoading ? <Text style={styles.empty}>No applications yet.</Text> : null
            }
          />
        ) : (
          <FlatList
            data={savedJobs ?? []}
            keyExtractor={(s) => s.jobId}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <JobCard
                job={{
                  id: item.job.id,
                  title: item.job.title,
                  description: "",
                  salaryMin: item.job.salaryMin,
                  salaryMax: item.job.salaryMax,
                  currency: item.job.currency,
                  location: item.job.location,
                  jobType: null,
                  isRemote: item.job.isRemote,
                  viewCount: 0,
                  createdAt: item.savedAt,
                  company: item.job.company,
                }}
                onPress={() => router.push({ pathname: "/job/[id]", params: { id: item.job.id } })}
                isSaved
                onToggleSave={() => unsaveJob(item.jobId)}
              />
            )}
            ListEmptyComponent={
              !savedLoading ? <Text style={styles.empty}>No saved jobs yet.</Text> : null
            }
          />
        )}
      </View>
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
  logoBadge: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.textPrimary,
    alignItems: "center", justifyContent: "center",
  },
  logoLetter: { color: colors.accent, fontWeight: "800", fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  listContent: { paddingTop: 20, paddingBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: colors.textPrimary },
  sectionSubtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  total: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40, fontSize: 14 },
});