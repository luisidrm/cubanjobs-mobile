import { useRouter } from "expo-router";
import { Bookmark, ListChecks } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useGetMyApplicationsQuery, useWithdrawApplicationMutation } from "../../../store/api/applicationApi";
import { useGetMySavedJobsQuery, useUnsaveJobMutation } from "../../../store/api/savedJobsApi";
import { ApplicationCard } from "../../components/application/ApplicationCard";
import { EmptyState, NavBar, Screen, SegmentedControl, Skeleton } from "../../components/ds";
import { JobCard } from "../../components/Jobs/JobCard";
import { NotificationBell } from "../../components/notifications/NotificationBell";
import { confirmAction } from "../../lib/confirm";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";

type ActivityTab = "applications" | "saved";

function SkeletonList() {
  return (
    <View style={{ gap: 14 }}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height={110} radius={20} />
      ))}
    </View>
  );
}

export default function ActivityScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<ActivityTab>("applications");

  const { data: applications, isLoading: appsLoading } = useGetMyApplicationsQuery(undefined, {
    skip: tab !== "applications",
  });
  const [withdrawApplication] = useWithdrawApplicationMutation();

  const { data: savedJobs, isLoading: savedLoading } = useGetMySavedJobsQuery(undefined, {
    skip: tab !== "saved",
  });
  const [unsaveJob] = useUnsaveJobMutation();

  async function handleWithdraw(applicationId: string) {
    const ok = await confirmAction(t("activity.confirmWithdrawTitle"), t("activity.confirmWithdrawMessage"), {
      confirm: t("activity.withdraw"),
      cancel: t("jobDetails.cancel"),
    });
    if (ok) withdrawApplication(applicationId);
  }

  const listPadding = { paddingHorizontal: 16, paddingTop: 4, paddingBottom: TAB_BAR_CLEARANCE };
  const goExplore = () => router.push("/jobs");

  return (
    <Screen safeTop={false}>
      <NavBar large title={t("tabs.activity")} trailing={<NotificationBell />} />

      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <SegmentedControl<ActivityTab>
          value={tab}
          onChange={setTab}
          options={[
            { value: "applications", label: t("activity.tabApplications") },
            { value: "saved", label: t("activity.tabSaved") },
          ]}
        />
      </View>

      {tab === "applications" ? (
        <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          data={applications ?? []}
          keyExtractor={(a) => a.id}
          contentContainerStyle={listPadding}
          ListHeaderComponent={appsLoading ? <SkeletonList /> : undefined}
          renderItem={({ item }) => (
            <ApplicationCard
              application={item}
              onPress={() => router.push({ pathname: "/job/[id]", params: { id: item.job.id } })}
              onWithdraw={() => handleWithdraw(item.id)}
            />
          )}
          ListEmptyComponent={
            appsLoading ? undefined : (
              <EmptyState icon={ListChecks} message={t("activity.emptyApplications")} actionLabel={t("activity.exploreJobs")} onAction={goExplore} />
            )
          }
        />
      ) : (
        <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          data={savedJobs ?? []}
          keyExtractor={(s) => s.jobId}
          contentContainerStyle={listPadding}
          ListHeaderComponent={savedLoading ? <SkeletonList /> : undefined}
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
                coverImageUrl: item.job.coverImageUrl,
                createdAt: item.savedAt,
                company: item.job.company,
              }}
              onPress={() => router.push({ pathname: "/job/[id]", params: { id: item.job.id } })}
              isSaved
              onToggleSave={() => unsaveJob(item.jobId)}
            />
          )}
          ListEmptyComponent={
            savedLoading ? undefined : (
              <EmptyState icon={Bookmark} message={t("activity.emptySaved")} actionLabel={t("activity.exploreJobs")} onAction={goExplore} />
            )
          }
        />
      )}
    </Screen>
  );
}
