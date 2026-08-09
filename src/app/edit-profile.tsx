import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useGetMeQuery, useUpdateProfileMutation } from "../../store/api/usersApi";
import { colors } from "../theme/colors";

export default function EditProfileScreen() {
  const { t } = useTranslation();
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
      router.back();
    } catch {
      Alert.alert(t("profile.editProfile.saveError"));
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("profile.editProfile.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.label}>{t("profile.editProfile.firstName")}</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>{t("profile.editProfile.lastName")}</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>{t("profile.editProfile.bio")}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={bio}
              onChangeText={setBio}
              placeholder={t("profile.editProfile.bioPlaceholder")}
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <Text style={styles.label}>{t("profile.editProfile.location")}</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder={t("profile.editProfile.locationPlaceholder")}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>{t("profile.editProfile.phone")}</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t("profile.editProfile.phonePlaceholder")}
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>{t("profile.editProfile.linkedin")}</Text>
            <TextInput
              style={styles.input}
              value={linkedinUrl}
              onChangeText={setLinkedinUrl}
              placeholder="https://linkedin.com/in/..."
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.saveButtonText}>{t("profile.editProfile.save")}</Text>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: "#EEEEF0",
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: colors.textPrimary,
  },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  saveButton: {
    backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 16,
    alignItems: "center", marginTop: 28,
  },
  saveButtonText: { color: colors.surface, fontWeight: "800", fontSize: 15 },
});
