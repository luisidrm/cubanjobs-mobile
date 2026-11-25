import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FileText, MessageCircle, User, Users, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";
import {
  useGetApplicationsForJobQuery,
  useUpdateApplicationNotesMutation,
  useUpdateApplicationStatusMutation,
} from "../../store/api/applicationApi";
import { StatusBadge } from "../components/application/StatusBadge";
import { Button, Card, NavBar, Screen, Text, TextField, CardSkeletons, EmptyState } from "../components/ds";
import { FilterChip } from "../components/tabs/FilterChip";
import { useTokens } from "../theme/use-tokens";
import type { ApplicationStatus, ApplicationWithApplicant, EmployerSettableStatus } from "../types/application";
import { openExternal } from "../lib/openExternal";
import { whatsappChatUrl } from "../lib/whatsapp";

const SETTABLE_STATUSES: EmployerSettableStatus[] = ["pending", "reviewed", "interview", "accepted", "rejected"];

function ApplicantCard({ application }: { application: ApplicationWithApplicant }) {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateApplicationStatusMutation();
  const [updateNotes, { isLoading: savingNotes }] = useUpdateApplicationNotesMutation();
  const [notes, setNotes] = useState(application.employerNotes ?? "");
  const notesDirty = notes !== (application.employerNotes ?? "");

  const { applicant } = application;
  const fullName = [applicant.firstName, applicant.lastName].filter(Boolean).join(" ") || applicant.email;
  const initials = `${applicant.firstName?.[0] ?? applicant.email[0]}${applicant.lastName?.[0] ?? ""}`.toUpperCase();
  const whatsappDigits = applicant.phone?.replace(/\D/g, "") ?? "";

  return (
    <Card style={{ marginBottom: 12, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: p.accentSoft,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {applicant.profilePictureUrl ? (
            <Image source={{ uri: applicant.profilePictureUrl }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text variant="headline" tone="accent">
              {initials}
            </Text>
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="headline" numberOfLines={1}>
            {fullName}
          </Text>
          <Text variant="footnote" tone="tertiary" numberOfLines={1}>
            {applicant.email}
          </Text>
        </View>
        <StatusBadge status={application.status} />
      </View>

      {application.coverLetter ? (
        <Text variant="subhead" tone="secondary" numberOfLines={4}>
          {application.coverLetter}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button size="sm" variant="secondary" icon={FileText} title={t("jobApplicants.viewResume")} onPress={() => openExternal(application.resumeUrl, t("common.cantOpenLink"))} />
        <Button
          size="sm"
          variant="secondary"
          icon={User}
          title={t("jobApplicants.viewProfile")}
          onPress={() => router.push({ pathname: "/applicant-profile", params: { userId: applicant.id } })}
        />
        {whatsappDigits ? (
          <Button
            size="sm"
            variant="tinted"
            icon={MessageCircle}
            title={t("jobApplicants.contactWhatsapp")}
            onPress={() => openExternal(whatsappChatUrl(whatsappDigits), t("common.cantOpenLink"))}
          />
        ) : null}
      </View>

      <View style={application.status === "withdrawn" ? { display: "none" } : undefined}>
        <Text variant="caps" tone="tertiary" style={{ marginBottom: 8 }}>
          {t("jobApplicants.changeStatus")}
        </Text>
        <ScrollView showsVerticalScrollIndicator={false} horizontal showsHorizontalScrollIndicator={false}>
          {SETTABLE_STATUSES.map((s) => (
            <FilterChip
              key={s}
              label={t(`applicationStatus.${s}`)}
              active={application.status === s}
              onPress={() => updateStatus({ id: application.id, status: s })}
            />
          ))}
          {updatingStatus ? <ActivityIndicator size="small" color={p.accent} /> : null}
        </ScrollView>
      </View>

      <TextField
        label={t("jobApplicants.notes")}
        value={notes}
        onChangeText={setNotes}
        placeholder={t("jobApplicants.notesPlaceholder")}
        multiline
        rows={2}
      />
      {notesDirty ? (
        <Button
          block
          size="sm"
          title={t("jobApplicants.saveNotes")}
          loading={savingNotes}
          onPress={() => updateNotes({ id: application.id, employerNotes: notes })}
        />
      ) : null}
    </Card>
  );
}

export default function JobApplicantsScreen() {
  const { t } = useTranslation();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { data: applications, isLoading, isError, refetch } = useGetApplicationsForJobQuery(jobId);
  // Pipeline view: one stage at a time, with a count on each.
  const [stage, setStage] = useState<ApplicationStatus | "all">("all");
  const all = applications ?? [];
  const visible = all.filter((a) => stage === "all" || a.status === stage);
  const countOf = (s: ApplicationStatus) => all.filter((a) => a.status === s).length;

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("jobApplicants.title")} />

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <CardSkeletons />
        </View>
      ) : null}

      {isError && !isLoading ? (
        <EmptyState icon={WifiOff} tone="danger" message={t("jobApplicants.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
      ) : null}

      {!isLoading && !isError ? (
        <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          data={visible}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
          renderItem={({ item }) => <ApplicantCard application={item} />}
          ListHeaderComponent={
            all.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <FilterChip label={`${t("jobApplicants.all")} (${all.length})`} active={stage === "all"} onPress={() => setStage("all")} />
                {SETTABLE_STATUSES.map((s) => (
                  <FilterChip key={s} label={`${t(`applicationStatus.${s}`)} (${countOf(s)})`} active={stage === s} onPress={() => setStage(s)} />
                ))}
              </ScrollView>
            ) : undefined
          }
          ListEmptyComponent={<EmptyState icon={Users} message={all.length > 0 ? t("jobApplicants.emptyStage") : t("jobApplicants.empty")} />}
        />
      ) : null}
    </Screen>
  );
}
