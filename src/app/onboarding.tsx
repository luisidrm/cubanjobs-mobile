import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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
import { useCreateCompanyMutation } from "../../store/api/companiesApi";
import { useGetEmailVerificationStatusQuery, useResendVerificationEmailMutation } from "../../store/api/authApi";
import {
  useAddSkillMutation,
  useCompleteOnboardingMutation,
  useGetMeQuery,
  useGetSkillsCatalogQuery,
  useRemoveSkillMutation,
  useUploadCvMutation,
} from "../../store/api/usersApi";
import { SegmentedControl } from "../components/application/SegmentedControl";
import { SkillChip } from "../components/users/SkillChip";
import { appendFilePart } from "../lib/upload";
import { showErrorToast } from "../lib/toast";
import { colors } from "../theme/colors";
import type { EmployeeCount } from "../types/company";

type Step = "welcome" | "skills" | "cv" | "verify" | "company";

const EMPLOYEE_STEPS: Step[] = ["welcome", "skills", "cv"];
const EMPLOYER_STEPS_UNVERIFIED: Step[] = ["welcome", "verify", "company"];
const EMPLOYER_STEPS_VERIFIED: Step[] = ["welcome", "company"];

const EMPLOYEE_COUNT_OPTIONS: { key: EmployeeCount; label: string }[] = [
  { key: "1-10", label: "1-10" },
  { key: "11-50", label: "11-50" },
  { key: "51-200", label: "51-200" },
  { key: "200+", label: "200+" },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const isEmployer = me?.role === "employer";

  const [step, setStep] = useState<Step>("welcome");
  const [finishing, setFinishing] = useState(false);
  const [completeOnboarding] = useCompleteOnboardingMutation();

  // ---- skills (employee) ----
  const { data: catalog } = useGetSkillsCatalogQuery(undefined, { skip: !me || isEmployer });
  const [search, setSearch] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [addSkill, { isLoading: addingSkill }] = useAddSkillMutation();
  const [removeSkill] = useRemoveSkillMutation();

  const addedSkills = useMemo(() => me?.skills ?? [], [me]);
  const addedSkillNames = useMemo(
    () => new Set(addedSkills.map((s) => s.skill.toLowerCase())),
    [addedSkills]
  );
  const filteredCatalog = useMemo(() => {
    if (!catalog) return [];
    const q = search.trim().toLowerCase();
    return q ? catalog.filter((c) => c.name.toLowerCase().includes(q)) : catalog;
  }, [catalog, search]);

  async function handleToggleSkill(name: string) {
    const existing = addedSkills.find((s) => s.skill.toLowerCase() === name.toLowerCase());
    try {
      if (existing) {
        await removeSkill(existing.id).unwrap();
      } else {
        await addSkill({ skill: name }).unwrap();
      }
    } catch {
      showErrorToast(t("onboarding.addSkillError"));
    }
  }

  async function handleAddCustomSkill() {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    try {
      await addSkill({ skill: trimmed }).unwrap();
      setCustomSkill("");
    } catch {
      showErrorToast(t("onboarding.addSkillError"));
    }
  }

  // ---- CV (employee) ----
  const [uploadCv, { isLoading: cvUploading }] = useUploadCvMutation();

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
      showErrorToast(t("onboarding.uploadError"));
    }
  }

  // ---- email verification (employer) ----
  const { data: verification, refetch: refetchVerification } = useGetEmailVerificationStatusQuery(
    undefined,
    { skip: !isEmployer }
  );
  const [resendVerificationEmail, { isLoading: resending }] = useResendVerificationEmailMutation();
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (step === "verify" && verification?.isVerified) {
      setStep("company");
    }
  }, [step, verification?.isVerified]);

  async function handleResend() {
    try {
      await resendVerificationEmail().unwrap();
      setResent(true);
    } catch {
      // Best-effort — user can just tap again.
    }
  }

  // ---- company (employer) ----
  const [createCompany, { isLoading: creatingCompany }] = useCreateCompanyMutation();
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyEmployeeCount, setCompanyEmployeeCount] = useState<EmployeeCount | undefined>(undefined);

  async function handleCreateCompanyAndFinish() {
    if (!companyName.trim()) {
      showErrorToast(t("companyProfile.nameRequired"));
      return;
    }
    try {
      await createCompany({
        name: companyName.trim(),
        description: companyDescription.trim() || undefined,
        website: companyWebsite.trim() || undefined,
        industry: companyIndustry.trim() || undefined,
        location: companyLocation.trim() || undefined,
        employeeCount: companyEmployeeCount,
      }).unwrap();
    } catch {
      showErrorToast(t("companyProfile.saveError"));
      return;
    }
    await finishOnboarding();
  }

  // ---- navigation ----
  async function finishOnboarding() {
    setFinishing(true);
    try {
      await completeOnboarding().unwrap();
      router.replace(isEmployer ? "/my-jobs" : "/jobs");
    } catch {
      showErrorToast(t("onboarding.finishError"));
      setFinishing(false);
    }
  }

  function handleWelcomeContinue() {
    if (isEmployer) {
      setStep(verification?.isVerified === false ? "verify" : "company");
    } else {
      setStep("skills");
    }
  }

  const dotsForRole = isEmployer
    ? verification?.isVerified === false
      ? EMPLOYER_STEPS_UNVERIFIED
      : EMPLOYER_STEPS_VERIFIED
    : EMPLOYEE_STEPS;

  if (meLoading || !me) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {step !== "welcome" ? (
          <Pressable
            onPress={() => setStep(step === "cv" ? "skills" : "welcome")}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}

        <View style={styles.dots}>
          {dotsForRole.map((s) => (
            <View key={s} style={[styles.dot, s === step && styles.dotActive]} />
          ))}
        </View>

        <Pressable onPress={finishOnboarding} disabled={finishing} hitSlop={12}>
          <Text style={styles.skipText}>{t("onboarding.skip")}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {step === "welcome" && (
            <>
              <View style={styles.logoBadge}>
                <Text style={styles.logoLetter}>B</Text>
              </View>
              <Text style={styles.title}>
                {isEmployer ? t("onboarding.employerWelcomeTitle") : t("onboarding.employeeWelcomeTitle")}
              </Text>
              <Text style={styles.subtitle}>
                {isEmployer ? t("onboarding.employerWelcomeSubtitle") : t("onboarding.employeeWelcomeSubtitle")}
              </Text>
              <Pressable
                style={styles.primaryButton}
                onPress={handleWelcomeContinue}
                disabled={isEmployer && verification === undefined}
              >
                {isEmployer && verification === undefined ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.primaryButtonText}>{t("onboarding.continue")}</Text>
                )}
              </Pressable>
            </>
          )}

          {step === "skills" && (
            <>
              <Text style={styles.title}>{t("onboarding.skillsTitle")}</Text>
              <Text style={styles.subtitle}>{t("onboarding.skillsSubtitle")}</Text>

              <TextInput
                style={styles.input}
                value={search}
                onChangeText={setSearch}
                placeholder={t("onboarding.skillsSearchPlaceholder") as string}
                placeholderTextColor={colors.textMuted}
              />

              <View style={styles.chipWrap}>
                {filteredCatalog.map((item) => {
                  const active = addedSkillNames.has(item.name.toLowerCase());
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.catalogChip, active && styles.catalogChipActive]}
                      onPress={() => handleToggleSkill(item.name)}
                      disabled={addingSkill}
                    >
                      {active && (
                        <Ionicons name="checkmark" size={14} color={colors.surface} style={{ marginRight: 4 }} />
                      )}
                      <Text style={[styles.catalogChipText, active && styles.catalogChipTextActive]}>
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.customSkillRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={customSkill}
                  onChangeText={setCustomSkill}
                  placeholder={t("onboarding.addCustomSkillPlaceholder") as string}
                  placeholderTextColor={colors.textMuted}
                  onSubmitEditing={handleAddCustomSkill}
                />
                <Pressable style={styles.addButton} onPress={handleAddCustomSkill} disabled={addingSkill}>
                  <Text style={styles.addButtonText}>{t("onboarding.add")}</Text>
                </Pressable>
              </View>

              {addedSkills.length > 0 && (
                <View style={[styles.chipWrap, { marginTop: 16 }]}>
                  {addedSkills.map((s) => (
                    <SkillChip key={s.id} label={s.skill} onRemove={() => removeSkill(s.id)} />
                  ))}
                </View>
              )}

              <Pressable style={styles.primaryButton} onPress={() => setStep("cv")}>
                <Text style={styles.primaryButtonText}>{t("onboarding.continue")}</Text>
              </Pressable>
            </>
          )}

          {step === "cv" && (
            <>
              <Text style={styles.title}>{t("onboarding.cvTitle")}</Text>
              <Text style={styles.subtitle}>{t("onboarding.cvSubtitle")}</Text>

              <Pressable style={styles.uploadCard} onPress={handleUploadCv} disabled={cvUploading}>
                {cvUploading ? (
                  <ActivityIndicator color={colors.accent} />
                ) : (
                  <>
                    <Ionicons
                      name={me.cvUrl ? "checkmark-circle" : "cloud-upload-outline"}
                      size={28}
                      color={colors.accent}
                    />
                    <Text style={styles.uploadCardText}>
                      {me.cvUrl ? t("onboarding.cvUploaded") : t("onboarding.uploadCv")}
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable style={styles.primaryButton} onPress={finishOnboarding} disabled={finishing}>
                {finishing ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.primaryButtonText}>{t("onboarding.finish")}</Text>
                )}
              </Pressable>
            </>
          )}

          {step === "verify" && (
            <>
              <Text style={styles.title}>{t("onboarding.verifyTitle")}</Text>
              <Text style={styles.subtitle}>{t("onboarding.verifySubtitle")}</Text>

              <View style={styles.verifyCard}>
                <Ionicons name="mail-unread-outline" size={28} color={colors.accent} />
                <Pressable onPress={handleResend} disabled={resending || resent} style={{ marginTop: 10 }}>
                  <Text style={styles.verifyResend}>
                    {resent ? t("verifyBanner.resent") : t("verifyBanner.resend")}
                  </Text>
                </Pressable>
              </View>

              <Pressable style={styles.primaryButton} onPress={() => refetchVerification()}>
                <Text style={styles.primaryButtonText}>{t("onboarding.checkAgain")}</Text>
              </Pressable>
            </>
          )}

          {step === "company" && (
            <>
              <Text style={styles.title}>{t("onboarding.companyTitle")}</Text>
              <Text style={styles.subtitle}>{t("onboarding.companySubtitle")}</Text>

              <Text style={styles.label}>{t("companyProfile.name")}</Text>
              <TextInput
                style={styles.input}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder={t("companyProfile.namePlaceholder") as string}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>{t("companyProfile.description")}</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                value={companyDescription}
                onChangeText={setCompanyDescription}
                placeholder={t("companyProfile.descriptionPlaceholder") as string}
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <Text style={styles.label}>{t("companyProfile.website")}</Text>
              <TextInput
                style={styles.input}
                value={companyWebsite}
                onChangeText={setCompanyWebsite}
                placeholder="https://"
                autoCapitalize="none"
                keyboardType="url"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>{t("companyProfile.industry")}</Text>
              <TextInput
                style={styles.input}
                value={companyIndustry}
                onChangeText={setCompanyIndustry}
                placeholder={t("companyProfile.industryPlaceholder") as string}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>{t("companyProfile.location")}</Text>
              <TextInput
                style={styles.input}
                value={companyLocation}
                onChangeText={setCompanyLocation}
                placeholder={t("companyProfile.locationPlaceholder") as string}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.label}>{t("companyProfile.employeeCount")}</Text>
              <SegmentedControl
                options={EMPLOYEE_COUNT_OPTIONS}
                value={companyEmployeeCount ?? ""}
                onChange={(k) => setCompanyEmployeeCount(k as EmployeeCount)}
              />

              <Pressable
                style={styles.primaryButton}
                onPress={handleCreateCompanyAndFinish}
                disabled={creatingCompany || finishing}
              >
                {creatingCompany || finishing ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <Text style={styles.primaryButtonText}>{t("onboarding.finish")}</Text>
                )}
              </Pressable>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.chipBorder },
  dotActive: { backgroundColor: colors.accent, width: 18 },
  skipText: { fontSize: 13, fontWeight: "700", color: colors.textSecondary },
  body: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48 },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoLetter: { color: colors.accent, fontWeight: "800", fontSize: 26, fontFamily: "InstrumentSerif_400Regular" },
  title: { fontSize: 22, fontWeight: "800", color: colors.textPrimary, fontFamily: "InstrumentSerif_400Regular" },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEEEF0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 16,
  },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 16 },
  catalogChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginRight: 8,
    marginBottom: 8,
  },
  catalogChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  catalogChipText: { fontSize: 13, fontWeight: "700", color: colors.chipText },
  catalogChipTextActive: { color: colors.surface },
  customSkillRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  addButton: {
    backgroundColor: colors.accentSoft,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 16,
  },
  addButtonText: { fontSize: 14, fontWeight: "700", color: colors.accentStrong },
  uploadCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    paddingVertical: 32,
    marginTop: 20,
  },
  uploadCardText: { fontSize: 14, fontWeight: "700", color: colors.textPrimary },
  verifyCard: {
    alignItems: "center",
    backgroundColor: colors.accentSoft,
    borderRadius: 16,
    paddingVertical: 28,
    marginTop: 20,
  },
  verifyResend: { fontSize: 14, fontWeight: "700", color: colors.accent },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  primaryButtonText: { color: colors.surface, fontWeight: "800", fontSize: 15 },
});
