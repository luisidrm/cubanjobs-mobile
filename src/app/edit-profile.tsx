import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useGetMeQuery, useUpdateProfileMutation } from "../../store/api/usersApi";
import { Button, NavBar, Screen, TextField, ACTION_BAR_CLEARANCE, GlassActionBar } from "../components/ds";
import { showErrorToast } from "../lib/toast";
import { useTokens } from "../theme/use-tokens";
import { goBack } from "../lib/navigation";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();

  const { data: user, isLoading } = useGetMeQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setBio(user.bio ?? "");
    setLocation(user.location ?? "");
    setPhone(user.phone ?? "");
    setLinkedinUrl(user.linkedinUrl ?? "");
  }, [user]);

  async function handleSave() {
    if (!user) return;
    try {
      await updateProfile({
        id: user.id,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        phone: phone.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
      }).unwrap();
      goBack(router);
    } catch {
      showErrorToast(t("profile.editProfile.saveError"));
    }
  }

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("profile.editProfile.title")} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={p.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: ACTION_BAR_CLEARANCE, gap: 20 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextField containerStyle={{ flex: 1 }} label={t("profile.editProfile.firstName")} value={firstName} onChangeText={setFirstName} autoComplete="given-name" />
              <TextField containerStyle={{ flex: 1 }} label={t("profile.editProfile.lastName")} value={lastName} onChangeText={setLastName} autoComplete="family-name" />
            </View>
            <TextField
              label={t("profile.editProfile.bio")}
              value={bio}
              onChangeText={setBio}
              placeholder={t("profile.editProfile.bioPlaceholder")}
              multiline
              rows={4}
            />
            <TextField
              label={t("profile.editProfile.location")}
              value={location}
              onChangeText={setLocation}
              placeholder={t("profile.editProfile.locationPlaceholder")}
            />
            <TextField
              label={t("profile.editProfile.phone")}
              value={phone}
              onChangeText={setPhone}
              placeholder={t("profile.editProfile.phonePlaceholder")}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
            <TextField
              label={t("profile.editProfile.linkedin")}
              value={linkedinUrl}
              onChangeText={setLinkedinUrl}
              placeholder="https://linkedin.com/in/..."
              autoCapitalize="none"
              keyboardType="url"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      <GlassActionBar>
        <Button block size="lg" title={t("profile.editProfile.save")} loading={saving} onPress={handleSave} />
      </GlassActionBar>
    </Screen>
  );
}
