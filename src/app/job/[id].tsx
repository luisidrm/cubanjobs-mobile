import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { TFunction } from "i18next";
import { Bookmark, BookmarkCheck, Check, ChevronRight, Clock, Globe, MapPin, Send, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useApplyToJobMutation, useGetMyApplicationsQuery } from "../../../store/api/applicationApi";
import { useGetJobByIdQuery } from "../../../store/api/jobsApi";
import { CompanyLogo } from "../../components/company/CompanyLogo";
import { useGetMeQuery } from "../../../store/api/usersApi";
import { useGetMySavedJobsQuery, useSaveJobMutation, useUnsaveJobMutation } from "../../../store/api/savedJobsApi";
import {
  ACTION_BAR_CLEARANCE,
  AlertDialog,
  Badge,
  Button,
  Card,
  EmptyState,
  GlassActionBar,
  Icon,
  IconButton,
  NavBar,
  PressableScale,
  Screen,
  Skeleton,
  Text,
} from "../../components/ds";
import { isEmployeePlanActive } from "../../lib/plan-status";
import { useSession } from "../../lib/session";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import { useTokens } from "../../theme/use-tokens";

function formatSalaryRange(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  const fmt = (n: number) => n.toLocaleString();
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

function formatPostedAgo(createdAt: string, t: TFunction) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000));
  return days === 0 ? t("jobDetails.postedToday") : t("jobDetails.postedDaysAgo", { count: days });
}

export default function JobDetailsScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { status } = useSession();
  const guest = status !== "authenticated";
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: job, isLoading, isError, refetch } = useGetJobByIdQuery(id);
  // Account-bound queries only run for signed-in users; guests browse read-only.
  const { data: myApplications } = useGetMyApplicationsQuery(undefined, { skip: guest });
  const [applyToJob, { isLoading: applying }] = useApplyToJobMutation();
  const { data: savedJobs } = useGetMySavedJobsQuery(undefined, { skip: guest });
  const [saveJob] = useSaveJobMutation();
  const [unsaveJob] = useUnsaveJobMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const { data: me } = useGetMeQuery(undefined, { skip: guest });

  const hasApplied = myApplications?.some((a) => a.job.id === id && a.status !== "withdrawn");
  const isSaved = savedJobs?.some((s) => s.jobId === id) ?? false;

  function handleSave() {
    if (guest) return setGuestOpen(true);
    void (isSaved ? unsaveJob(id) : saveJob(id));
  }

  function handleApply() {
    if (guest) return setGuestOpen(true);
    // Employees apply only with an active plan. Checked here so the pay screen
    // opens before they type anything; the API enforces it too (402).
    if (me?.role === "employee" && !isEmployeePlanActive(me)) return setPaywallOpen(true);
    setConfirmOpen(true);
  }

  async function doApply() {
    try {
      await applyToJob({ jobId: id }).unwrap();
      showSuccessToast(t("jobDetails.applySuccessMessage"));
    } catch (err) {
      if ((err as { status?: number })?.status === 402) {
        setPaywallOpen(true);
        return;
      }
      showErrorToast(t("jobDetails.applyError"));
    }
  }

  const salary = job ? formatSalaryRange(job.salaryMin, job.salaryMax) : null;

  return (
    <Screen safeTop={false}>
      <NavBar
        back
        title={t("jobDetails.title")}
        trailing={
          <IconButton
            icon={isSaved ? BookmarkCheck : Bookmark}
            label={isSaved ? t("job.unsave", { defaultValue: "Unsave" }) : t("job.save", { defaultValue: "Save" })}
            variant={isSaved ? "primary" : "glass"}
            onPress={handleSave}
          />
        }
      />

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 16 }}>
          <Skeleton width={90} height={24} radius={12} />
          <Skeleton height={76} radius={10} />
          <Skeleton width="60%" height={22} />
          <Skeleton height={150} radius={20} />
          <Skeleton height={14} />
          <Skeleton height={14} width="90%" />
        </View>
      ) : null}

      {isError && !isLoading ? (
        <EmptyState icon={WifiOff} tone="danger" message={t("jobDetails.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
      ) : null}

      {job ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: ACTION_BAR_CLEARANCE + 20, gap: 24 }}>
            {job.coverImageUrl ? (
              <Image
                source={{ uri: job.coverImageUrl }}
                style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 20, backgroundColor: p.fill2 }}
                contentFit="cover"
                accessibilityIgnoresInvertColors
              />
            ) : null}
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Badge tone="success" dot>
                  {t("jobDetails.active")}
                </Badge>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Icon icon={Clock} size={14} color={p.text3} />
                  <Text variant="footnote" tone="tertiary">
                    {formatPostedAgo(job.createdAt, t)}
                  </Text>
                </View>
              </View>

              <Text accessibilityRole="header" weight="bold" style={{ fontSize: 32, lineHeight: 38, letterSpacing: -0.03 * 32 }}>
                {job.title}
              </Text>

              {job.company?.name ? (
                <PressableScale
                  accessibilityRole="link"
                  onPress={() => router.push({ pathname: "/company/[id]", params: { id: job.company.id } })}
                  style={{ flexDirection: "row", alignItems: "center", gap: 10, alignSelf: "flex-start", minHeight: 44 }}
                >
                  <CompanyLogo name={job.company.name} logoUrl={job.company.logoUrl} size={32} />
                  <Text weight="semibold" tone="accent" style={{ fontSize: 17, lineHeight: 22 }}>
                    {job.company.name}
                  </Text>
                  <Icon icon={ChevronRight} size={18} color={p.accentText} />
                </PressableScale>
              ) : null}
            </View>

            <Card padding={0}>
              <View style={{ padding: 16, gap: 4 }}>
                <Text variant="caps" tone="tertiary">
                  {t("jobDetails.salary")}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                  <Text weight="bold" tabular style={{ fontSize: 24, lineHeight: 30 }}>
                    {salary ?? t("jobDetails.salaryNotDisclosed")}
                  </Text>
                  {salary && job.currency ? (
                    <Text mono tone="secondary" style={{ fontSize: 14, lineHeight: 20 }}>
                      {t("jobDetails.perMonth", { currency: job.currency })}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: p.separator }} />
              <View style={{ flexDirection: "row" }}>
                <View style={{ flex: 1, padding: 16, gap: 4 }}>
                  <Text variant="caps" tone="tertiary">
                    {t("jobDetails.jobType")}
                  </Text>
                  <Text weight="semibold">{job.jobType ? t(`jobType.${job.jobType}`) : "—"}</Text>
                </View>
                <View style={{ width: 1, backgroundColor: p.separator }} />
                <View style={{ flex: 1, padding: 16, gap: 4 }}>
                  <Text variant="caps" tone="tertiary">
                    {t("jobDetails.location")}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Icon icon={job.isRemote ? Globe : MapPin} size={14} color={p.accent} />
                    <Text weight="semibold" style={{ flexShrink: 1 }}>
                      {job.isRemote ? t("jobDetails.remote") : (job.location ?? "—")}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            <View style={{ gap: 10 }}>
              <Text variant="title2">{t("jobDetails.aboutRole")}</Text>
              <Text variant="body" tone="secondary">
                {job.description}
              </Text>
            </View>
          </ScrollView>

          <GlassActionBar>
            <Button
              block
              size="lg"
              icon={hasApplied ? Check : Send}
              title={hasApplied ? t("jobDetails.alreadyApplied") : t("jobDetails.applyNow")}
              disabled={!!hasApplied}
              loading={applying}
              onPress={handleApply}
            />
          </GlassActionBar>

          <AlertDialog
            open={confirmOpen}
            title={t("jobDetails.confirmApplyTitle")}
            message={t("jobDetails.confirmApplyMessage")}
            onClose={() => setConfirmOpen(false)}
            actions={[
              { label: t("jobDetails.cancel"), style: "cancel" },
              { label: t("jobDetails.confirm"), onPress: () => void doApply() },
            ]}
          />
          <AlertDialog
            open={paywallOpen}
            title={t("plans.paywallTitle")}
            message={t("plans.paywallMessage")}
            onClose={() => setPaywallOpen(false)}
            actions={[
              { label: t("jobDetails.cancel"), style: "cancel" },
              { label: t("plans.viewPlan"), onPress: () => router.push("/plans") },
            ]}
          />
          <AlertDialog
            open={guestOpen}
            title={t("welcome.guestTitle")}
            message={t("welcome.guestMessage")}
            onClose={() => setGuestOpen(false)}
            actions={[
              { label: t("jobDetails.cancel"), style: "cancel" },
              { label: t("login.signIn"), onPress: () => router.push("/login") },
            ]}
          />
        </>
      ) : null}
    </Screen>
  );
}
