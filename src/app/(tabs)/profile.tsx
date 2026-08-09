import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useDispatch } from "react-redux";
import SuperTokens from "supertokens-react-native";
import { applicationsApi } from "../../../store/api/applicationApi";
import { companiesApi } from "../../../store/api/companiesApi";
import { savedJobsApi } from "../../../store/api/savedJobsApi";
import {
  useAddExperienceMutation,
  useAddSkillMutation,
  useDeleteExperienceMutation,
  useGetMeQuery,
  useRemoveSkillMutation,
  useUpdateExperienceMutation,
  useUploadAvatarMutation,
  useUploadCvMutation,
  usersApi,
} from "../../../store/api/usersApi";
import { clearAuth } from "../../../store/slices/authSlice";
import { appendFilePart } from "../../lib/upload";
import { confirmAction } from "../../lib/confirm";
import { SettingsLinkRow, SettingsToggleRow } from "../../components/users/SettingsRow";
import { AddSkillChip, SkillChip } from "../../components/users/SkillChip";
import { ExperienceCard } from "../../components/users/ExperienceCard";
import { ExperienceForm, type ExperienceFormValues } from "../../components/users/ExperienceForm";
import { colors } from "../../theme/colors";
import type { WorkExperience } from "../../types/user";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: user, isLoading, isError, refetch } = useGetMeQuery();
  const [notifications, setNotifications] = useState(true);
  const [uploadAvatar, { isLoading: avatarUploading }] = useUploadAvatarMutation();
  const [uploadCv, { isLoading: cvUploading }] = useUploadCvMutation();

  const [addSkill] = useAddSkillMutation();
  const [removeSkill] = useRemoveSkillMutation();
  const [addingSkill, setAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const [addExperience, { isLoading: addingExperience }] = useAddExperienceMutation();
  const [updateExperience, { isLoading: updatingExperience }] = useUpdateExperienceMutation();
  const [deleteExperience] = useDeleteExperienceMutation();
  const [experienceFormTarget, setExperienceFormTarget] = useState<WorkExperience | "new" | null>(null);

  async function handleAddSkill() {
    const skill = newSkill.trim();
    if (!skill) return;
    try {
      await addSkill({ skill }).unwrap();
      setNewSkill("");
      setAddingSkill(false);
    } catch {
      Alert.alert(t("profile.workExperience.skillError"));
    }
  }

  async function handleRemoveSkill(skillId: string) {
    const ok = await confirmAction(
      t("profile.workExperience.confirmRemoveSkillTitle"),
      t("profile.workExperience.confirmRemoveSkillMessage"),
      { confirm: t("profile.workExperience.remove"), cancel: t("profile.workExperience.cancel") }
    );
    if (ok) removeSkill(skillId);
  }

  async function handleSubmitExperience(values: ExperienceFormValues) {
    try {
      if (experienceFormTarget === "new") {
        await addExperience({
          title: values.title,
          organization: values.organization || undefined,
          description: values.description || undefined,
          contact: values.contact || undefined,
        }).unwrap();
      } else if (experienceFormTarget) {
        await updateExperience({
          id: experienceFormTarget.id,
          title: values.title,
          organization: values.organization || undefined,
          description: values.description || undefined,
          contact: values.contact || undefined,
        }).unwrap();
      }
      setExperienceFormTarget(null);
    } catch {
      Alert.alert(t("profile.workExperience.saveError"));
    }
  }

  async function handleDeleteExperience(id: string) {
    const ok = await confirmAction(
      t("profile.workExperience.confirmDeleteTitle"),
      t("profile.workExperience.confirmDeleteMessage"),
      { confirm: t("profile.workExperience.remove"), cancel: t("profile.workExperience.cancel") }
    );
    if (ok) deleteExperience(id);
  }

  async function doSignOut() {
    // SuperTokens.signOut() invalidates the session server-side AND
    // clears the device's locally-stored tokens — a plain fetch to
    // /auth/signout would leave stale tokens on the device.
    await SuperTokens.signOut();
    dispatch(clearAuth());
    dispatch(usersApi.util.resetApiState());
    dispatch(applicationsApi.util.resetApiState());
    dispatch(savedJobsApi.util.resetApiState());
    dispatch(companiesApi.util.resetApiState());
    router.replace("/");
  }

  function handleSignOut() {
    // react-native-web's Alert.alert() is a no-op — it never renders a
    // dialog or invokes a button's onPress, so the confirm+signout logic
    // must run through window.confirm on web instead.
    if (Platform.OS === "web") {
      if (window.confirm(t("profile.signOutConfirmMessage") as string)) {
        void doSignOut();
      }
      return;
    }

    Alert.alert(
      t("profile.signOutConfirmTitle"),
      t("profile.signOutConfirmMessage"),
      [
        { text: t("profile.cancel"), style: "cancel" },
        {
          text: t("profile.signOut"),
          style: "destructive",
          onPress: () => void doSignOut(),
        },
      ]
    );
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";
  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "";

  async function handleEditAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const ext = asset.mimeType?.split("/")[1] ?? "jpg";
    const formData = new FormData();
    await appendFilePart(formData, "file", {
      uri: asset.uri,
      name: asset.fileName ?? `avatar.${ext}`,
      mimeType: asset.mimeType ?? "image/jpeg",
      webFile: asset.file,
    });

    try {
      await uploadAvatar(formData).unwrap();
    } catch {
      Alert.alert(t("profile.uploadError"));
    }
  }

  async function handleUploadCv() {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
    await appendFilePart(formData, "file", {
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/pdf",
      webFile: asset.file,
    });

    try {
      await uploadCv(formData).unwrap();
    } catch {
      Alert.alert(t("profile.uploadError"));
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoLetter}>C</Text>
          </View>
          <Text style={styles.headerTitle}>{t("tabs.profile")}</Text>
        </View>
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("profile.error")}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>{t("profile.retry")}</Text>
          </Pressable>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.body}>
        {!isLoading && user && (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                {user.profilePictureUrl ? (
                  <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{fullName || user.email}</Text>
                {user.location && (
                  <View style={styles.locationRow}>
                    <View style={styles.dot} />
                    <Text style={styles.location}>{user.location}</Text>
                  </View>
                )}
              </View>
              <Pressable style={styles.editButton} onPress={handleEditAvatar} disabled={avatarUploading}>
                {avatarUploading ? (
                  <ActivityIndicator size="small" color={colors.textPrimary} />
                ) : (
                  <>
                    <Ionicons name="pencil" size={14} color={colors.textPrimary} />
                    <Text style={styles.editText}>Edit</Text>
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.settingsCard}>
              <SettingsLinkRow
                icon="create-outline"
                title={t("profile.editProfile.title")}
                subtitle={t("profile.editProfile.subtitle")}
                onPress={() => router.push("/edit-profile")}
              />
            </View>

            {user.role === "employee" && (
              <>
                <Text style={styles.sectionLabel}>YOUR ESSENTIALS</Text>
                <Text style={styles.sectionTitle}>CV & Documents</Text>

                <View style={styles.cvCard}>
                  <View style={styles.cvIcon}>
                    <Ionicons name="document-text" size={20} color={colors.accent} />
                  </View>
                  <View style={styles.cvInfo}>
                    <Text style={styles.cvName}>
                      {user.cvUrl ? user.cvUrl.split("/").pop() : "No CV uploaded"}
                    </Text>
                    <Text style={styles.cvType}>PDF document</Text>
                  </View>
                  <Pressable style={styles.uploadButton} onPress={handleUploadCv} disabled={cvUploading}>
                    {cvUploading ? (
                      <ActivityIndicator size="small" color={colors.textPrimary} />
                    ) : (
                      <>
                        <Ionicons name="cloud-upload-outline" size={16} color={colors.textPrimary} />
                        <Text style={styles.uploadText}>Upload new</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </>
            )}

            {user.role === "employer" && (
              <View style={styles.settingsCard}>
                <SettingsLinkRow
                  icon="business-outline"
                  title={t("profile.companyProfile")}
                  subtitle={t("profile.companyProfileSubtitle")}
                  onPress={() => router.push("/company-profile")}
                />
              </View>
            )}

            {user.role === "employee" && (
              <>
                <View style={styles.skillsHeader}>
                  <Text style={styles.sectionTitleLarge}>Skills</Text>
                  <Text style={styles.skillsCount}>{user.skills.length} added</Text>
                </View>
                <View style={styles.skillsWrap}>
                  {user.skills.map((s) => (
                    <SkillChip key={s.id} label={s.skill} onRemove={() => handleRemoveSkill(s.id)} />
                  ))}
                  {!addingSkill && <AddSkillChip onPress={() => setAddingSkill(true)} />}
                </View>
                {addingSkill && (
                  <View style={styles.addSkillRow}>
                    <TextInput
                      value={newSkill}
                      onChangeText={setNewSkill}
                      placeholder={t("profile.workExperience.skillPlaceholder") as string}
                      placeholderTextColor={colors.textMuted}
                      style={styles.addSkillInput}
                      autoFocus
                      onSubmitEditing={handleAddSkill}
                    />
                    <Pressable style={styles.addSkillConfirm} onPress={handleAddSkill}>
                      <Ionicons name="checkmark" size={18} color={colors.surface} />
                    </Pressable>
                    <Pressable
                      style={styles.addSkillCancel}
                      onPress={() => {
                        setAddingSkill(false);
                        setNewSkill("");
                      }}
                    >
                      <Ionicons name="close" size={18} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                )}

                <View style={styles.skillsHeader}>
                  <Text style={styles.sectionTitleLarge}>{t("profile.workExperience.title")}</Text>
                  <Text style={styles.skillsCount}>
                    {t("profile.workExperience.count", { count: user.experience.length })}
                  </Text>
                </View>
                {user.experience.map((exp) =>
                  experienceFormTarget !== "new" && experienceFormTarget?.id === exp.id ? (
                    <ExperienceForm
                      key={exp.id}
                      initial={exp}
                      submitting={updatingExperience}
                      onSubmit={handleSubmitExperience}
                      onCancel={() => setExperienceFormTarget(null)}
                    />
                  ) : (
                    <ExperienceCard
                      key={exp.id}
                      experience={exp}
                      onEdit={() => setExperienceFormTarget(exp)}
                      onDelete={() => handleDeleteExperience(exp.id)}
                    />
                  )
                )}
                {experienceFormTarget === "new" ? (
                  <ExperienceForm
                    submitting={addingExperience}
                    onSubmit={handleSubmitExperience}
                    onCancel={() => setExperienceFormTarget(null)}
                  />
                ) : (
                  <Pressable style={styles.addExperienceButton} onPress={() => setExperienceFormTarget("new")}>
                    <Ionicons name="add" size={16} color={colors.textSecondary} />
                    <Text style={styles.addExperienceText}>{t("profile.workExperience.add")}</Text>
                  </Pressable>
                )}
              </>
            )}

            <Text style={styles.sectionTitleLarge}>Settings</Text>
            <View style={styles.settingsCard}>
              <SettingsToggleRow
                icon="notifications-outline"
                title="Notifications"
                subtitle="Job alerts and updates"
                value={notifications}
                onChange={setNotifications}
              />
              <SettingsLinkRow
                icon="globe-outline"
                title="Language"
                subtitle={i18n.language === "es" ? "Español" : "English"}
                onPress={() => {}}
              />
              <SettingsLinkRow
                icon="lock-closed-outline"
                title="Privacy Policy"
                subtitle="How we protect your data"
                onPress={() => {}}
              />
            </View>

            <Pressable style={styles.signOutButton} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={18} color="#D64545" />
              <Text style={styles.signOutText}>{t("profile.signOut")}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBadge: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: colors.textPrimary,
    alignItems: "center", justifyContent: "center",
  },
  logoLetter: { color: colors.accent, fontWeight: "800", fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  retryButton: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  profileCard: {
    backgroundColor: colors.surface, borderRadius: 20, padding: 18,
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EEEEF0",
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.textPrimary,
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.accentSoft,
  },
  avatarText: { color: colors.accent, fontWeight: "800", fontSize: 22 },
  avatarImage: { width: "100%", height: "100%", borderRadius: 32 },
  profileInfo: { flex: 1, marginLeft: 14 },
  name: { fontSize: 19, fontWeight: "800", color: colors.textPrimary },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  location: { fontSize: 13, color: colors.textSecondary },
  editButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  editText: { fontWeight: "700", fontSize: 14, color: colors.textPrimary },
  sectionLabel: { color: colors.accent, fontWeight: "800", fontSize: 12, letterSpacing: 1, marginTop: 28 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: colors.textPrimary, marginTop: 4, marginBottom: 14 },
  sectionTitleLarge: { fontSize: 20, fontWeight: "800", color: colors.textPrimary, marginTop: 28, marginBottom: 14 },
  cvCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#EEEEF0",
  },
  cvIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: colors.accentSoft,
    alignItems: "center", justifyContent: "center",
  },
  cvInfo: { flex: 1, marginLeft: 12 },
  cvName: { fontWeight: "700", fontSize: 14, color: colors.textPrimary },
  cvType: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  uploadButton: {
    flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1,
    borderColor: colors.chipBorder, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10,
  },
  uploadText: { fontWeight: "700", fontSize: 13, color: colors.textPrimary },
  skillsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28 },
  skillsCount: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 14 },
  addSkillRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: -4, marginBottom: 14 },
  addSkillInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: "#EEEEF0",
  },
  addSkillConfirm: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent,
    alignItems: "center", justifyContent: "center",
  },
  addSkillCancel: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background,
    alignItems: "center", justifyContent: "center",
  },
  addExperienceButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 16, borderWidth: 1, borderStyle: "dashed", borderColor: colors.chipBorder,
    paddingVertical: 14, marginBottom: 10,
  },
  addExperienceText: { fontWeight: "700", fontSize: 14, color: colors.textSecondary },
  settingsCard: {
    backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16,
    borderWidth: 1, borderColor: "#EEEEF0",
  },
  signOutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 20, paddingVertical: 14,
  },
  signOutText: { color: "#D64545", fontWeight: "700", fontSize: 15 },
});