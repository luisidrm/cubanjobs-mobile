import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  useGetApplicationsForJobQuery,
  useUpdateApplicationNotesMutation,
  useUpdateApplicationStatusMutation,
} from "../../store/api/applicationApi";
import { StatusBadge } from "../components/application/StatusBadge";
import { FilterChip } from "../components/tabs/FilterChip";
import { colors } from "../theme/colors";
import type { ApplicationWithApplicant, EmployerSettableStatus } from "../types/application";

const SETTABLE_STATUSES: EmployerSettableStatus[] = ["pending", "reviewed", "accepted", "rejected"];

function ApplicantCard({ application }: { application: ApplicationWithApplicant }) {
  const { t } = useTranslation();
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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          {applicant.profilePictureUrl ? (
            <Image source={{ uri: applicant.profilePictureUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <View style={styles.cardHeaderInfo}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{applicant.email}</Text>
        </View>
        <StatusBadge status={application.status} />
      </View>

      {application.coverLetter && (
        <Text style={styles.coverLetter} numberOfLines={4}>{application.coverLetter}</Text>
      )}

      <View style={styles.linkRow}>
        <Pressable style={styles.resumeLink} onPress={() => Linking.openURL(application.resumeUrl)}>
          <Ionicons name="document-text-outline" size={16} color={colors.accent} />
          <Text style={styles.resumeLinkText}>{t("jobApplicants.viewResume")}</Text>
        </Pressable>

        <Pressable
          style={styles.resumeLink}
          onPress={() => router.push({ pathname: "/applicant-profile", params: { userId: applicant.id } })}
        >
          <Ionicons name="person-outline" size={16} color={colors.accent} />
          <Text style={styles.resumeLinkText}>{t("jobApplicants.viewProfile")}</Text>
        </Pressable>

        {whatsappDigits && (
          <Pressable
            style={styles.whatsappLink}
            onPress={() => Linking.openURL(`https://wa.me/${whatsappDigits}`)}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            <Text style={styles.whatsappLinkText}>{t("jobApplicants.contactWhatsapp")}</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionLabel}>{t("jobApplicants.changeStatus")}</Text>
      <View style={styles.statusRow}>
        {SETTABLE_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={t(`applicationStatus.${s}`)}
            active={application.status === s}
            onPress={() => updateStatus({ id: application.id, status: s })}
          />
        ))}
        {updatingStatus && <ActivityIndicator size="small" color={colors.accent} />}
      </View>

      <Text style={styles.sectionLabel}>{t("jobApplicants.notes")}</Text>
      <TextInput
        style={styles.notesInput}
        value={notes}
        onChangeText={setNotes}
        placeholder={t("jobApplicants.notesPlaceholder")}
        placeholderTextColor={colors.textMuted}
        multiline
      />
      {notesDirty && (
        <Pressable
          style={styles.saveNotesButton}
          onPress={() => updateNotes({ id: application.id, employerNotes: notes })}
          disabled={savingNotes}
        >
          {savingNotes ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Text style={styles.saveNotesText}>{t("jobApplicants.saveNotes")}</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

export default function JobApplicantsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { data: applications, isLoading, isError, refetch } = useGetApplicationsForJobQuery(jobId);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("jobApplicants.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("jobApplicants.error")}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>{t("jobDetails.retry")}</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={applications ?? []}
          keyExtractor={(a) => a.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <ApplicantCard application={item} />}
          ListEmptyComponent={<Text style={styles.empty}>{t("jobApplicants.empty")}</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  headerSpacer: { width: 26 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  retryButton: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
  listContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40, fontSize: 14 },
  card: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: "#EEEEF0",
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.textPrimary,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: colors.accent, fontWeight: "800", fontSize: 15 },
  cardHeaderInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  name: { fontSize: 15, fontWeight: "700", color: colors.textPrimary },
  email: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  coverLetter: { fontSize: 13, color: colors.textSecondary, marginTop: 14, lineHeight: 19 },
  linkRow: { flexDirection: "row", flexWrap: "wrap", gap: 18, marginTop: 14 },
  resumeLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  resumeLinkText: { fontWeight: "700", fontSize: 13, color: colors.accent },
  whatsappLink: { flexDirection: "row", alignItems: "center", gap: 6 },
  whatsappLinkText: { fontWeight: "700", fontSize: 13, color: "#25D366" },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, marginTop: 16, marginBottom: 8 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4 },
  notesInput: {
    backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: "#EEEEF0",
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: colors.textPrimary, minHeight: 60, textAlignVertical: "top",
  },
  saveNotesButton: { backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 10, alignItems: "center", marginTop: 10 },
  saveNotesText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
});
