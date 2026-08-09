import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
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
import {
  useCreateCompanyMutation,
  useGetMyCompaniesQuery,
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
} from "../../store/api/companiesApi";
import { SegmentedControl } from "../components/application/SegmentedControl";
import { appendFilePart } from "../lib/upload";
import { colors } from "../theme/colors";
import type { EmployeeCount } from "../types/company";

const EMPLOYEE_COUNT_OPTIONS: { key: EmployeeCount; label: string }[] = [
  { key: "1-10", label: "1-10" },
  { key: "11-50", label: "11-50" },
  { key: "51-200", label: "51-200" },
  { key: "200+", label: "200+" },
];

export default function CompanyProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: companies, isLoading } = useGetMyCompaniesQuery();
  const company = companies?.[0];

  const [createCompany, { isLoading: creating }] = useCreateCompanyMutation();
  const [updateCompany, { isLoading: updating }] = useUpdateCompanyMutation();
  const [uploadLogo, { isLoading: uploadingLogo }] = useUploadCompanyLogoMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [employeeCount, setEmployeeCount] = useState<EmployeeCount | undefined>(undefined);

  useEffect(() => {
    if (!company) return;
    setName(company.name);
    setDescription(company.description ?? "");
    setWebsite(company.website ?? "");
    setIndustry(company.industry ?? "");
    setLocation(company.location ?? "");
    setEmployeeCount(company.employeeCount ?? undefined);
  }, [company]);

  const saving = creating || updating;

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(t("companyProfile.nameRequired"));
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      website: website.trim() || undefined,
      industry: industry.trim() || undefined,
      location: location.trim() || undefined,
      employeeCount,
    };

    try {
      if (company) {
        await updateCompany({ id: company.id, ...payload }).unwrap();
      } else {
        await createCompany(payload).unwrap();
      }
      Alert.alert(t("companyProfile.savedTitle"), t("companyProfile.savedMessage"));
    } catch {
      Alert.alert(t("companyProfile.saveError"));
    }
  }

  async function handleUploadLogo() {
    if (!company) return;
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
      name: asset.fileName ?? `logo.${ext}`,
      mimeType: asset.mimeType ?? "image/jpeg",
      webFile: asset.file,
    });

    try {
      await uploadLogo({ companyId: company.id, formData }).unwrap();
    } catch {
      Alert.alert(t("companyProfile.uploadError"));
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("companyProfile.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.body}>
            {company && (
              <View style={styles.logoSection}>
                <View style={styles.logo}>
                  {company.logoUrl ? (
                    <Image source={{ uri: company.logoUrl }} style={styles.logoImage} />
                  ) : (
                    <Ionicons name="business" size={28} color={colors.accent} />
                  )}
                </View>
                <Pressable style={styles.editButton} onPress={handleUploadLogo} disabled={uploadingLogo}>
                  {uploadingLogo ? (
                    <ActivityIndicator size="small" color={colors.textPrimary} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={16} color={colors.textPrimary} />
                      <Text style={styles.editText}>{t("companyProfile.uploadLogo")}</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}

            <Text style={styles.label}>{t("companyProfile.name")}</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t("companyProfile.namePlaceholder")} placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>{t("companyProfile.description")}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={description}
              onChangeText={setDescription}
              placeholder={t("companyProfile.descriptionPlaceholder")}
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <Text style={styles.label}>{t("companyProfile.website")}</Text>
            <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://" autoCapitalize="none" keyboardType="url" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>{t("companyProfile.industry")}</Text>
            <TextInput style={styles.input} value={industry} onChangeText={setIndustry} placeholder={t("companyProfile.industryPlaceholder")} placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>{t("companyProfile.location")}</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder={t("companyProfile.locationPlaceholder")} placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>{t("companyProfile.employeeCount")}</Text>
            <SegmentedControl
              options={EMPLOYEE_COUNT_OPTIONS}
              value={employeeCount ?? ""}
              onChange={(k) => setEmployeeCount(k as EmployeeCount)}
            />

            <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.saveButtonText}>{company ? t("companyProfile.saveChanges") : t("companyProfile.create")}</Text>
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
  logoSection: { alignItems: "center", marginBottom: 24, gap: 10 },
  logo: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: colors.accentSoft,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  logoImage: { width: "100%", height: "100%" },
  editButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  editText: { fontWeight: "700", fontSize: 13, color: colors.textPrimary },
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
