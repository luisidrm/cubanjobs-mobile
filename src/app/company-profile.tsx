import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Building2, Upload } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  useCreateCompanyMutation,
  useGetMyCompaniesQuery,
  useUpdateCompanyMutation,
  useUploadCompanyLogoMutation,
} from "../../store/api/companiesApi";
import { Button, Icon, NavBar, Screen, SegmentedControl, Text, TextField, ACTION_BAR_CLEARANCE, GlassActionBar } from "../components/ds";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import { appendFilePart } from "../lib/upload";
import { RenewalNotice } from "../components/plans/RenewalNotice";
import { useTokens } from "../theme/use-tokens";
import type { EmployeeCount } from "../types/company";
import { goBack } from "../lib/navigation";

const EMPLOYEE_COUNT_OPTIONS: { value: EmployeeCount; label: string }[] = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "200+", label: "200+" },
];

export default function CompanyProfileScreen() {
  const { t } = useTranslation();
  const p = useTokens();
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

  const [seededFrom, setSeededFrom] = useState<typeof company>(undefined);
  if (company && company !== seededFrom) {
    setSeededFrom(company);
    setName(company.name);
    setDescription(company.description ?? "");
    setWebsite(company.website ?? "");
    setIndustry(company.industry ?? "");
    setLocation(company.location ?? "");
    setEmployeeCount(company.employeeCount ?? undefined);
  }

  const saving = creating || updating;

  async function handleSave() {
    if (!name.trim()) {
      showErrorToast(t("companyProfile.nameRequired"));
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
      showSuccessToast(t("companyProfile.savedMessage"));
    } catch {
      showErrorToast(t("companyProfile.saveError"));
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
      showErrorToast(t("companyProfile.uploadError"));
    }
  }

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("companyProfile.title")} />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={p.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: ACTION_BAR_CLEARANCE, gap: 20 }}>
            {company ? (
              <View style={{ alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 24,
                    backgroundColor: p.accentSoft,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {company.logoUrl ? (
                    <Image source={{ uri: company.logoUrl }} style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <Icon icon={Building2} size={32} color={p.accent} />
                  )}
                </View>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Upload}
                  title={t("companyProfile.uploadLogo")}
                  loading={uploadingLogo}
                  onPress={handleUploadLogo}
                />
                {company.planTier !== "free" ? (
                  <View style={{ alignItems: "center" }}>
                    <RenewalNotice company={company} />
                  </View>
                ) : null}
              </View>
            ) : null}

            <TextField label={t("companyProfile.name")} value={name} onChangeText={setName} placeholder={t("companyProfile.namePlaceholder")} />

            <TextField
              label={t("companyProfile.description")}
              value={description}
              onChangeText={setDescription}
              placeholder={t("companyProfile.descriptionPlaceholder")}
              multiline
              rows={4}
            />

            <TextField label={t("companyProfile.website")} value={website} onChangeText={setWebsite} placeholder="https://" autoCapitalize="none" keyboardType="url" />

            <TextField label={t("companyProfile.industry")} value={industry} onChangeText={setIndustry} placeholder={t("companyProfile.industryPlaceholder")} />

            <TextField label={t("companyProfile.location")} value={location} onChangeText={setLocation} placeholder={t("companyProfile.locationPlaceholder")} />

            <View>
              <Text variant="footnote" weight="medium" tone="secondary" style={{ paddingLeft: 4, marginBottom: 8 }}>
                {t("companyProfile.employeeCount")}
              </Text>
              <SegmentedControl<EmployeeCount>
                options={EMPLOYEE_COUNT_OPTIONS}
                value={employeeCount ?? ("" as EmployeeCount)}
                onChange={setEmployeeCount}
              />
            </View>

            {/* Back is handled by the NavBar; kept explicit for accessibility after creating a company. */}
            {company ? <Button block variant="plain" title={t("jobDetails.cancel")} onPress={() => goBack(router)} /> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
      <GlassActionBar>
        <Button
          block
          size="lg"
          title={company ? t("companyProfile.saveChanges") : t("companyProfile.create")}
          loading={saving}
          onPress={handleSave}
        />
      </GlassActionBar>
    </Screen>
  );
}
