import { useRouter } from "expo-router";
import { Building2, Calendar, ChevronRight, Eye, Pencil, Plus, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useGetMyCompaniesQuery } from "../../../store/api/companiesApi";
import { useGetJobsByCompanyQuery } from "../../../store/api/jobsApi";
import { AlertDialog, Badge, Card, CardSkeletons, EmptyState, Icon, IconButton, NavBar, PressableScale, Screen, Text, VerifyBanner, type BadgeTone } from "../../components/ds";
import { PlanBanner } from "../../components/plans/PlanBanner";
import { JoinCompany } from "../../components/team/JoinCompany";
import { NotificationBell } from "../../components/notifications/NotificationBell";
import { getPlanJobLimit } from "../../lib/plans";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import type { EmployerJob, JobStatus } from "../../types/job";

// draft = neutral, active = success, closed = danger, expired = warning
const STATUS_TONE: Record<JobStatus, BadgeTone> = {
  draft: "neutral",
  active: "success",
  closed: "danger",
  expired: "warning",
};

/** Job header (tile, title, views) + status badge; hairline; 48pt footer with date and Edit. */
function MyJobRow({ job, onPress, onEdit }: { job: EmployerJob; onPress: () => void; onEdit: () => void }) {
  const { t, i18n } = useTranslation();
  const p = useTokens();
  const created = new Date(job.createdAt).toLocaleDateString(i18n.language, { month: "short", day: "numeric" });
  return (
    <Card onPress={onPress} accessibilityLabel={job.title} padding={0} style={{ marginBottom: 14 }}>
      <View style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center" }}>
          <Text weight="bold" tone="accent" style={{ fontSize: 18, lineHeight: 22 }}>
            {job.title.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text weight="semibold" numberOfLines={1} style={{ fontSize: 16, lineHeight: 21 }}>
            {job.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Icon icon={Eye} size={14} color={p.text3} />
            <Text variant="footnote" tone="tertiary" tabular>
              {job.viewCount}
            </Text>
          </View>
        </View>
        <Badge tone={STATUS_TONE[job.status]} dot>
          {t(`jobStatus.${job.status}`)}
        </Badge>
        <Icon icon={ChevronRight} size={18} color={p.text3} />
      </View>
      <View style={{ height: 1, backgroundColor: p.separator }} />
      <View style={{ height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingLeft: 16, paddingRight: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Icon icon={Calendar} size={14} color={p.text3} />
          <Text variant="footnote" tone="tertiary">
            {created}
          </Text>
        </View>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={t("common.edit")}
          onPress={onEdit}
          style={{ minHeight: 44, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <Icon icon={Pencil} size={14} color={p.accentText} />
          <Text variant="subhead" weight="semibold" tone="accent">
            Edit
          </Text>
        </PressableScale>
      </View>
    </Card>
  );
}

export default function MyJobsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [limitOpen, setLimitOpen] = useState(false);

  const { data: companies, isLoading: companiesLoading } = useGetMyCompaniesQuery();
  const company = companies?.[0];

  const { data: jobs, isLoading: jobsLoading, isError, refetch } = useGetJobsByCompanyQuery(company?.id ?? "", { skip: !company });

  // Proactive UX nicety only — the real enforcement is the backend 403 from
  // createJob/updateJob, already surfaced via job-form.tsx's existing error toast.
  function handlePostJob() {
    const limit = company ? getPlanJobLimit(company.planTier) : null;
    const activeCount = jobs?.filter((j) => j.status === "active").length ?? 0;

    if (limit !== null && activeCount >= limit) {
      setLimitOpen(true);
      return;
    }

    router.push("/job-form");
  }

  return (
    <Screen safeTop={false}>
      <NavBar
        large
        title={t("tabs.myJobs")}
        trailing={
          <>
            {company ? <IconButton icon={Plus} label={t("myJobs.postJob")} variant="primary" onPress={handlePostJob} /> : null}
            <NotificationBell />
          </>
        }
      />

      {companiesLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>
          <CardSkeletons />
        </View>
      ) : null}

      {!companiesLoading && !company ? (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16 }}>
            <VerifyBanner />
          </View>
          <EmptyState
            icon={Building2}
            message={`${t("myJobs.noCompanyTitle")}. ${t("myJobs.noCompanySubtitle")}`}
            actionLabel={t("myJobs.createCompany")}
            onAction={() => router.push("/company-profile")}
          />
          <View style={{ paddingHorizontal: 16, paddingBottom: TAB_BAR_CLEARANCE }}>
            <JoinCompany />
          </View>
        </View>
      ) : null}

      {company ? (
        <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          data={jobs ?? []}
          keyExtractor={(j) => j.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: TAB_BAR_CLEARANCE }}
          ListHeaderComponent={
            <View style={{ gap: 14, paddingBottom: 14 }}>
              <VerifyBanner />
              <PlanBanner />
              {jobsLoading ? <CardSkeletons /> : null}
            </View>
          }
          renderItem={({ item }) => (
            <MyJobRow
              job={item}
              onPress={() => router.push({ pathname: "/job-applicants", params: { jobId: item.id } })}
              onEdit={() => router.push({ pathname: "/job-form", params: { id: item.id } })}
            />
          )}
          ListEmptyComponent={
            jobsLoading ? undefined : isError ? (
              <EmptyState icon={WifiOff} tone="danger" message={t("explore.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
            ) : (
              <EmptyState icon={Building2} message={t("myJobs.noJobs")} actionLabel={t("myJobs.postJob")} onAction={handlePostJob} />
            )
          }
        />
      ) : null}

      <AlertDialog
        open={limitOpen}
        title={t("myJobs.limitReachedTitle")}
        message={t("myJobs.limitReachedMessage")}
        onClose={() => setLimitOpen(false)}
        actions={[
          { label: t("profile.cancel"), style: "cancel" },
          { label: t("myJobs.upgrade"), onPress: () => router.push("/billing") },
        ]}
      />
    </Screen>
  );
}
