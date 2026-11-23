import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Bell, Building2, Camera, Compass, CreditCard, FileText, Globe, Lock, LogOut, MapPin, Moon, Pencil, Plus, Sparkles, Trash2, Upload, WifiOff } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, ActivityIndicator, Alert, Platform, ScrollView, View } from "react-native";
import { useDispatch } from "react-redux";
import SuperTokens from "supertokens-react-native";
import { setLanguage } from "../../../i18n/i18n";

import { useGetMyCompaniesQuery } from "../../../store/api/companiesApi";

import { useAddExperienceMutation, useAddSkillMutation, useDeleteAccountMutation, useDeleteExperienceMutation, useGetMeQuery, useRemoveSkillMutation, useUpdateExperienceMutation, useUpdateProfileMutation, useUploadAvatarMutation, useUploadCvMutation } from "../../../store/api/usersApi";

import { Button, Card, CardSkeletons, EmptyState, Icon, List, ListRow, NavBar, PressableScale, Screen, Sheet, Skeleton, Text, TextField } from "../../components/ds";
import { ExperienceCard } from "../../components/users/ExperienceCard";
import { ExperienceForm, type ExperienceFormValues } from "../../components/users/ExperienceForm";
import { SettingsLinkRow, SettingsToggleRow } from "../../components/users/SettingsRow";
import { AddSkillChip, SkillChip } from "../../components/users/SkillChip";
import { confirmAction } from "../../lib/confirm";
import { resetSession } from "../../lib/resetSession";
import { useAppColorScheme } from "../../theme/scheme";
import { isEmployeePlanActive } from "../../lib/plan-status";
import { useSkillLabel } from "../../lib/skills";
import { setThemePreference } from "../../lib/theme-preference";
import { registerForPushNotificationsAsync } from "../../lib/pushNotifications";
import { showErrorToast } from "../../lib/toast";
import { appendFilePart } from "../../lib/upload";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import type { WorkExperience } from "../../types/user";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const skillLabel = useSkillLabel();
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: user, isLoading, isError, refetch } = useGetMeQuery();
  const { data: companies } = useGetMyCompaniesQuery(undefined, { skip: user?.role !== "employer" });
  const company = companies?.[0];
  const [updateProfile] = useUpdateProfileMutation();
  const [deleteAccount, { isLoading: deletingAccount }] = useDeleteAccountMutation();
  const [notificationsBusy, setNotificationsBusy] = useState(false);
  const [uploadAvatar, { isLoading: avatarUploading }] = useUploadAvatarMutation();
  const [uploadCv, { isLoading: cvUploading }] = useUploadCvMutation();

  async function handleToggleNotifications(value: boolean) {
    setNotificationsBusy(true);
    try {
      if (value) {
        const result = await registerForPushNotificationsAsync();
        if (result.status === "unsupported") {
          showErrorToast(t("profile.notifications.unsupported"));
          return;
        }
        if (result.status === "denied") {
          // The system prompt only appears once; after a denial the settings are the only way back.
          if (result.canAskAgain) {
            showErrorToast(t("profile.notifications.permissionDenied"));
          } else if (
            await confirmAction(t("profile.notifications.openSettingsTitle"), t("profile.notifications.openSettingsMessage"), {
              confirm: t("profile.notifications.openSettings"),
              cancel: t("profile.cancel"),
            })
          ) {
            await Linking.openSettings();
          }
          return;
        }
        await updateProfile({ id: user!.id, expoPushToken: result.token }).unwrap();
      } else {
        await updateProfile({ id: user!.id, expoPushToken: null }).unwrap();
      }
    } catch {
      showErrorToast(t("profile.notifications.error"));
    } finally {
      setNotificationsBusy(false);
    }
  }

  function handleToggleLanguage() {
    void setLanguage(i18n.language === "es" ? "en" : "es");
  }

  async function handleDeleteAccount() {
    const ok = await confirmAction(
      t("profile.deleteAccountConfirmTitle"),
      t("profile.deleteAccountConfirmMessage"),
      { confirm: t("profile.deleteAccount"), cancel: t("profile.cancel") }
    );
    if (!ok) return;

    try {
      await deleteAccount().unwrap();
      // The backend already destroyed the SuperTokens session server-side,
      // but the device still holds locally-stored tokens — clear those too,
      // same as doSignOut(), or useSession() will keep reporting "authenticated".
      await SuperTokens.signOut();
      resetSession(dispatch);
      router.replace("/");
    } catch {
      // Most likely cause: an employer still owns a company (backend 409) —
      // message is generic since we don't inspect error bodies elsewhere in this file either.
      showErrorToast(t("profile.deleteAccountError"));
    }
  }

  const [addSkill] = useAddSkillMutation();
  const [removeSkill] = useRemoveSkillMutation();
  const [newSkill, setNewSkill] = useState("");

  const [addExperience, { isLoading: addingExperience }] = useAddExperienceMutation();
  const [updateExperience, { isLoading: updatingExperience }] = useUpdateExperienceMutation();
  const [deleteExperience] = useDeleteExperienceMutation();
  const [experienceFormTarget, setExperienceFormTarget] = useState<WorkExperience | "new" | null>(null);

  async function handleAddSkill(): Promise<boolean> {
    const skill = newSkill.trim();
    if (!skill) return false;
    try {
      await addSkill({ skill }).unwrap();
      setNewSkill("");
      return true;
    } catch {
      showErrorToast(t("profile.workExperience.skillError"));
      return false;
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
      showErrorToast(t("profile.workExperience.saveError"));
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
    // The push token belongs to this phone, not to the account: leave it behind and the next person who signs in
    // here would receive the previous account's notifications. Best effort; signing out must not fail over it.
    if (user?.expoPushToken) {
      try {
        await updateProfile({ id: user.id, expoPushToken: null }).unwrap();
      } catch {
        /* offline or already invalid: carry on */
      }
    }
    await SuperTokens.signOut();
    resetSession(dispatch);
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
      showErrorToast(t("profile.uploadError"));
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
      showErrorToast(t("profile.uploadError"));
    }
  }

  const tokens = useTokens();
  const isDark = useAppColorScheme() === "dark";
  const [skillSheetOpen, setSkillSheetOpen] = useState(false);

  return (
    <Screen safeTop={false}>
      <NavBar large title={t("tabs.profile")} />

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 4, gap: 14 }}>
          <Skeleton height={96} radius={20} />
          <CardSkeletons count={2} height={120} />
        </View>
      ) : null}

      {isError && !isLoading ? (
        <EmptyState icon={WifiOff} tone="danger" message={t("profile.error")} actionLabel={t("profile.retry")} onAction={() => refetch()} />
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: TAB_BAR_CLEARANCE, gap: 24 }}>
        {!isLoading && user ? (
          <>
            <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={t("profile.editProfile.title")}
                onPress={handleEditAvatar}
                disabled={avatarUploading}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: tokens.accentSoft,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {avatarUploading ? (
                    <ActivityIndicator color={tokens.accent} />
                  ) : user.profilePictureUrl ? (
                    <Image source={{ uri: user.profilePictureUrl }} style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <Text variant="title2" tone="accent">
                      {initials}
                    </Text>
                  )}
                </View>
                <View
                  style={{
                    position: "absolute",
                    right: -2,
                    bottom: -2,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: tokens.accent,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: tokens.surfaceCard,
                  }}
                >
                  <Icon icon={Camera} size={12} color={tokens.onAccent} />
                </View>
              </PressableScale>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="title3" numberOfLines={1}>
                  {fullName || user.email}
                </Text>
                {user.location ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <Icon icon={MapPin} size={14} color={tokens.text3} />
                    <Text variant="footnote" tone="secondary" numberOfLines={1}>
                      {user.location}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Card>

            <List>
              <SettingsLinkRow
                icon={Pencil}
                title={t("profile.editProfile.title")}
                subtitle={t("profile.editProfile.subtitle")}
                onPress={() => router.push("/edit-profile")}
              />
              {user.role === "employee" ? (
                <SettingsLinkRow
                  icon={Sparkles}
                  iconBg={tokens.warning}
                  title={t("plans.profileRow")}
                  subtitle={isEmployeePlanActive(user) ? (user.planExpiresAt ? t("plans.activeUntil", { date: new Date(user.planExpiresAt).toLocaleDateString(i18n.language, { day: "numeric", month: "short", year: "numeric" }) }) : t("plans.noExpiry")) : t("plans.free")}
                  onPress={() => router.push("/plans")}
                />
              ) : null}
              {user.role === "employer" ? (
                <SettingsLinkRow
                  icon={Building2}
                  title={t("profile.companyProfile")}
                  subtitle={t("profile.companyProfileSubtitle")}
                  onPress={() => router.push("/company-profile")}
                />
              ) : null}
              {user.role === "employer" ? (
                <SettingsLinkRow
                  icon={CreditCard}
                  iconBg={tokens.info}
                  title={t("profile.billing.title")}
                  subtitle={company ? t(`billing.tiers.${company.planTier}.name`) : t("profile.billing.subtitle")}
                  onPress={() => router.push("/billing")}
                />
              ) : null}
            </List>

            {user.role === "employee" ? (
              <>
                <List header="CV & Documents">
                  <ListRow
                    leading={
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: tokens.accentSoft,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon icon={FileText} size={20} color={tokens.accent} />
                      </View>
                    }
                    title={user.cvUrl ? (user.cvUrl.split("/").pop() ?? "CV") : t("profile.noCv")}
                    subtitle={t("profile.pdfDocument")}
                    accessory={
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Upload}
                        title={t("common.upload")}
                        loading={cvUploading}
                        onPress={handleUploadCv}
                      />
                    }
                  />
                </List>

                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 4 }}>
                    <Text variant="title3">Skills</Text>
                    <Text variant="footnote" tone="tertiary" tabular>
                      {user.skills.length} added
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {user.skills.map((s) => (
                      <SkillChip key={s.id} label={skillLabel(s.skill)} onRemove={() => handleRemoveSkill(s.id)} />
                    ))}
                    <AddSkillChip onPress={() => setSkillSheetOpen(true)} />
                  </View>
                </View>

                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingHorizontal: 4 }}>
                    <Text variant="title3">{t("profile.workExperience.title")}</Text>
                    <Text variant="footnote" tone="tertiary" tabular>
                      {t("profile.workExperience.count", { count: user.experience.length })}
                    </Text>
                  </View>
                  <View>
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
                      ),
                    )}
                    {experienceFormTarget === "new" ? (
                      <ExperienceForm
                        submitting={addingExperience}
                        onSubmit={handleSubmitExperience}
                        onCancel={() => setExperienceFormTarget(null)}
                      />
                    ) : (
                      <Button
                        block
                        variant="tinted"
                        icon={Plus}
                        title={t("profile.workExperience.add")}
                        onPress={() => setExperienceFormTarget("new")}
                      />
                    )}
                  </View>
                </View>
              </>
            ) : null}

            <List header="Settings">
              <SettingsToggleRow
                icon={Bell}
                iconBg={tokens.warning}
                title={t("profile.notifications.title")}
                subtitle={t("profile.notifications.subtitle")}
                value={!!user.expoPushToken}
                onChange={handleToggleNotifications}
                disabled={notificationsBusy}
              />
              <SettingsToggleRow
                icon={Moon}
                iconBg={tokens.text2}
                title={t("profile.darkMode.title", { defaultValue: "Dark mode" })}
                subtitle={t("profile.darkMode.subtitle", { defaultValue: "Easier on the eyes at night" })}
                value={isDark}
                onChange={(on) => void setThemePreference(on ? "dark" : "light")}
              />
              <SettingsLinkRow
                icon={Globe}
                iconBg={tokens.info}
                title={t("profile.language")}
                subtitle={i18n.language === "es" ? "Español" : "English"}
                onPress={handleToggleLanguage}
              />
              <SettingsLinkRow
                icon={Lock}
                iconBg={tokens.text2}
                title={t("profile.privacyPolicy.title")}
                subtitle={t("profile.privacyPolicy.subtitle")}
                onPress={() => router.push("/privacy-policy")}
              />
              <SettingsLinkRow
                icon={Compass}
                title={t("about.linkTitle")}
                subtitle={t("about.linkSubtitle")}
                onPress={() => router.push("/about")}
              />
            </List>

            <View style={{ gap: 8 }}>
              <Button block variant="tinted" icon={LogOut} title={t("profile.signOut")} onPress={handleSignOut} />
              <Button
                block
                variant="destructive"
                icon={Trash2}
                title={t("profile.deleteAccount")}
                loading={deletingAccount}
                onPress={handleDeleteAccount}
              />
            </View>
          </>
        ) : null}
      </ScrollView>

      <Sheet
        open={skillSheetOpen}
        onClose={() => {
          setSkillSheetOpen(false);
          setNewSkill("");
        }}
        title={t("profile.addSkill")}
        footer={
          <Button
            block
            title={t("common.add")}
            disabled={!newSkill.trim()}
            onPress={async () => {
              if (await handleAddSkill()) setSkillSheetOpen(false);
            }}
          />
        }
      >
        <TextField
          value={newSkill}
          onChangeText={setNewSkill}
          placeholder={t("profile.workExperience.skillPlaceholder")}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={async () => {
            if (await handleAddSkill()) setSkillSheetOpen(false);
          }}
        />
      </Sheet>
    </Screen>
  );
}
