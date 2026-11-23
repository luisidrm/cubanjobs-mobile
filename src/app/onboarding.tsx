import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Building2, Check, CircleCheck, FileCheck2, FileText, MailCheck, MailWarning, Plus, Search, Upload, Wrench } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
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
import {
  ACTION_BAR_CLEARANCE,
  BrandMark,
  Button,
  Card,
  Chip,
  GlassActionBar,
  Icon,
  List,
  ListRow,
  OnboardingHeader,
  Screen,
  SegmentedControl,
  Text,
  TextField,
} from "../components/ds";
import { appendFilePart } from "../lib/upload";
import { skillMatches, useSkillLabel } from "../lib/skills";
import { showErrorToast } from "../lib/toast";
import { useTokens } from "../theme/use-tokens";
import { JoinCompany } from "../components/team/JoinCompany";
import type { EmployeeCount } from "../types/company";

type Step = "welcome" | "skills" | "cv" | "verify" | "company";

const EMPLOYEE_STEPS: Step[] = ["welcome", "skills", "cv"];
const EMPLOYER_STEPS_UNVERIFIED: Step[] = ["welcome", "verify", "company"];
const EMPLOYER_STEPS_VERIFIED: Step[] = ["welcome", "company"];

const EMPLOYEE_COUNT_OPTIONS: { value: EmployeeCount; label: string }[] = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "200+", label: "200+" },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();

  const { data: me, isLoading: meLoading } = useGetMeQuery();
  const isEmployer = me?.role === "employer";

  const [chosenStep, setStep] = useState<Step>("welcome");
  const [finishing, setFinishing] = useState(false);
  const [completeOnboarding] = useCompleteOnboardingMutation();

  // ---- skills (employee) ----
  const { data: catalog } = useGetSkillsCatalogQuery(undefined, { skip: !me || isEmployer });
  const skillLabel = useSkillLabel();
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
    return q ? catalog.filter((c) => skillMatches(c, q)) : catalog;
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
  const [checking, setChecking] = useState(false);
  const [nameError, setNameError] = useState(false);

  // Once the email is verified the verify step has nothing left to do, so move past it.
  const step: Step = chosenStep === "verify" && verification?.isVerified ? "company" : chosenStep;

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
  const [companyMode, setCompanyMode] = useState<"create" | "join">("create");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companyIndustry, setCompanyIndustry] = useState("");
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyEmployeeCount, setCompanyEmployeeCount] = useState<EmployeeCount | undefined>(undefined);

  async function handleCreateCompanyAndFinish() {
    if (!companyName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
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
      <Screen>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={p.accent} />
        </View>
      </Screen>
    );
  }

  const stepIndex = Math.max(0, dotsForRole.indexOf(step));
  const backTo: Step | null = stepIndex > 0 ? dotsForRole[stepIndex - 1] : null;
  const cvName = me.cvUrl ? decodeURIComponent(me.cvUrl.split("/").pop() ?? "CV.pdf") : null;

  async function handleCheckAgain() {
    setChecking(true);
    try {
      await refetchVerification();
    } finally {
      setChecking(false);
    }
  }

  const stepList: { icon: typeof Wrench; label: string }[] = isEmployer
    ? [
        ...(verification?.isVerified === false ? [{ icon: MailCheck, label: t("onboarding.stepVerify") }] : []),
        { icon: Building2, label: t("onboarding.stepCompany") },
      ]
    : [
        { icon: Wrench, label: t("onboarding.stepSkills") },
        { icon: FileText, label: t("onboarding.stepCv") },
      ];

  function heading(title: string, subtitle: string) {
    return (
      <View style={{ gap: 6, paddingHorizontal: 4 }}>
        <Text accessibilityRole="header" weight="bold" style={{ fontSize: 28, lineHeight: 34, letterSpacing: -0.025 * 28 }}>
          {title}
        </Text>
        <Text variant="callout" tone="secondary">
          {subtitle}
        </Text>
      </View>
    );
  }

  // The one primary action of each step, pinned in the glass bar.
  let cta: React.ReactNode = null;
  if (step === "welcome") {
    cta = (
      <Button
        block
        size="lg"
        title={t("onboarding.continue")}
        loading={isEmployer && verification === undefined}
        onPress={handleWelcomeContinue}
      />
    );
  } else if (step === "skills") {
    cta = <Button block size="lg" title={t("onboarding.continue")} onPress={() => setStep("cv")} />;
  } else if (step === "cv") {
    cta = <Button block size="lg" title={t("onboarding.finish")} loading={finishing} onPress={finishOnboarding} />;
  } else if (step === "verify") {
    cta = (
      <Button
        block
        title={checking ? t("onboarding.checking") : t("onboarding.checkAgain")}
        loading={checking}
        onPress={handleCheckAgain}
      />
    );
  } else if (step === "company" && companyMode === "create") {
    cta = (
      <Button
        block
        size="lg"
        title={t("onboarding.finish")}
        loading={creatingCompany || finishing}
        onPress={handleCreateCompanyAndFinish}
      />
    );
  }

  return (
    <Screen safeTop={false}>
      <OnboardingHeader
        step={stepIndex}
        total={dotsForRole.length}
        onBack={backTo ? () => setStep(backTo) : undefined}
        backLabel={t("common.back", { defaultValue: "Back" })}
        skipLabel={t("onboarding.skip")}
        onSkip={finishOnboarding}
        skipDisabled={finishing}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: step === "welcome" ? 40 : 24, paddingBottom: ACTION_BAR_CLEARANCE, gap: step === "welcome" ? 28 : 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {step === "welcome" ? (
            <>
              <View style={{ gap: 16, paddingHorizontal: 4 }}>
                <BrandMark size={64} />
                <Text accessibilityRole="header" variant="display">
                  {isEmployer ? t("onboarding.employerWelcomeTitle") : t("onboarding.employeeWelcomeTitle")}
                </Text>
                <Text weight="regular" tone="secondary" style={{ fontSize: 17, lineHeight: 25 }}>
                  {isEmployer ? t("onboarding.employerWelcomeSubtitle") : t("onboarding.employeeWelcomeSubtitle")}
                </Text>
              </View>
              <List header={t("onboarding.whatsNext")}>
                {stepList.map((row, idx) => (
                  <ListRow
                    key={row.label}
                    icon={row.icon}
                    title={row.label}
                    accessory={
                      <Text mono tone="tertiary" style={{ fontSize: 13 }}>
                        {String(idx + 1).padStart(2, "0")}
                      </Text>
                    }
                  />
                ))}
              </List>
            </>
          ) : null}

          {step === "skills" ? (
            <>
              {heading(t("onboarding.skillsTitle"), t("onboarding.skillsSubtitle"))}

              <TextField value={search} onChangeText={setSearch} icon={Search} placeholder={t("onboarding.skillsSearchPlaceholder")} />

              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {filteredCatalog.map((item) => (
                  <Chip
                    key={item.id}
                    label={skillLabel(item.name)}
                    selected={addedSkillNames.has(item.name.toLowerCase())}
                    disabled={addingSkill}
                    onPress={() => handleToggleSkill(item.name)}
                  />
                ))}
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TextField
                  containerStyle={{ flex: 1, minWidth: 0 }}
                  value={customSkill}
                  onChangeText={setCustomSkill}
                  placeholder={t("onboarding.addCustomSkillPlaceholder")}
                  onSubmitEditing={handleAddCustomSkill}
                  returnKeyType="done"
                />
                <Button variant="secondary" size="lg" icon={Plus} title={t("onboarding.add")} onPress={handleAddCustomSkill} disabled={addingSkill} />
              </View>

              {addedSkills.length > 0 ? (
                <Card variant="grouped" padding={16} style={{ gap: 12 }}>
                  <Text variant="caps" tone="tertiary">
                    {t("onboarding.selected")} · {addedSkills.length}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {addedSkills.map((sk) => (
                      <Chip
                        key={sk.id}
                        variant="removable"
                        label={skillLabel(sk.skill)}
                        removeLabel={`${t("onboarding.remove")} ${skillLabel(sk.skill)}`}
                        onRemove={() => removeSkill(sk.id)}
                      />
                    ))}
                  </View>
                </Card>
              ) : null}
            </>
          ) : null}

          {step === "cv" ? (
            <>
              {heading(t("onboarding.cvTitle"), t("onboarding.cvSubtitle"))}

              {cvUploading ? (
                <Card padding={36} style={{ alignItems: "center", gap: 12 }}>
                  <ActivityIndicator color={p.accent} size="large" />
                  <Text variant="headline" tone="secondary">
                    {t("onboarding.uploading")}
                  </Text>
                </Card>
              ) : cvName ? (
                <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: p.successSoft, alignItems: "center", justifyContent: "center" }}>
                    <Icon icon={FileCheck2} size={26} color={p.successText} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                    <Text mono numberOfLines={1} style={{ fontSize: 14, lineHeight: 20 }}>
                      {cvName}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Icon icon={CircleCheck} size={14} color={p.successText} />
                      <Text variant="footnote" weight="semibold" tone="success">
                        {t("onboarding.cvUploaded")}
                      </Text>
                    </View>
                  </View>
                  <Button size="sm" variant="plain" title={t("onboarding.replace")} onPress={handleUploadCv} />
                </Card>
              ) : (
                <Card onPress={handleUploadCv} accessibilityLabel={t("onboarding.uploadCv")} padding={0}>
                  <View style={{ alignItems: "center", paddingVertical: 36, paddingHorizontal: 20, gap: 10 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center" }}>
                      <Icon icon={Upload} size={28} color={p.accentText} />
                    </View>
                    <Text weight="semibold" tone="accent" style={{ fontSize: 17, lineHeight: 22 }}>
                      {t("onboarding.uploadCv")}
                    </Text>
                    <Text variant="footnote" tone="tertiary">
                      {t("onboarding.pdfOnly")}
                    </Text>
                  </View>
                </Card>
              )}
            </>
          ) : null}

          {step === "verify" ? (
            <>
              {heading(t("onboarding.verifyTitle"), t("onboarding.verifySubtitle"))}

              <Card padding={20} style={{ gap: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: p.warningSoft, alignItems: "center", justifyContent: "center" }}>
                    <Icon icon={MailWarning} size={22} color={p.warningText} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Text weight="semibold">{t("verifyBanner.title")}</Text>
                    <Text mono tone="secondary" numberOfLines={1} style={{ fontSize: 14, lineHeight: 20 }}>
                      {me.email}
                    </Text>
                  </View>
                </View>
                <Text variant="subhead" tone="secondary">
                  {t("verifyBanner.subtitle")}
                </Text>
                <Button
                  block
                  variant="secondary"
                  icon={resent ? Check : undefined}
                  title={resent ? t("verifyBanner.resent") : t("verifyBanner.resend")}
                  loading={resending}
                  disabled={resent}
                  onPress={handleResend}
                />
              </Card>
            </>
          ) : null}

          {step === "company" ? (
            <>
              {heading(t("onboarding.companyTitle"), t("onboarding.companySubtitle"))}

              <SegmentedControl<"create" | "join">
                options={[
                  { value: "create", label: t("onboarding.companyModeCreate") },
                  { value: "join", label: t("onboarding.companyModeJoin") },
                ]}
                value={companyMode}
                onChange={setCompanyMode}
              />

              {companyMode === "join" ? <JoinCompany onJoined={finishOnboarding} /> : (
              <>

              <TextField
                label={t("companyProfile.name")}
                value={companyName}
                onChangeText={(v) => {
                  setCompanyName(v);
                  if (nameError) setNameError(false);
                }}
                placeholder={t("companyProfile.namePlaceholder")}
                error={nameError ? t("companyProfile.nameRequired") : undefined}
              />
              <TextField
                label={t("companyProfile.description")}
                value={companyDescription}
                onChangeText={setCompanyDescription}
                placeholder={t("companyProfile.descriptionPlaceholder")}
                multiline
                rows={3}
              />
              <TextField
                label={t("companyProfile.website")}
                value={companyWebsite}
                onChangeText={setCompanyWebsite}
                placeholder="https://"
                autoCapitalize="none"
                keyboardType="url"
              />
              <TextField
                label={t("companyProfile.industry")}
                value={companyIndustry}
                onChangeText={setCompanyIndustry}
                placeholder={t("companyProfile.industryPlaceholder")}
              />
              <TextField
                label={t("companyProfile.location")}
                value={companyLocation}
                onChangeText={setCompanyLocation}
                placeholder={t("companyProfile.locationPlaceholder")}
              />
              <View>
                <Text variant="footnote" weight="medium" tone="secondary" style={{ paddingLeft: 4, marginBottom: 8 }}>
                  {t("companyProfile.employeeCount")}
                </Text>
                <SegmentedControl<EmployeeCount>
                  options={EMPLOYEE_COUNT_OPTIONS}
                  value={companyEmployeeCount ?? ("" as EmployeeCount)}
                  onChange={setCompanyEmployeeCount}
                />
              </View>
              </>
              )}
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {cta ? <GlassActionBar>{cta}</GlassActionBar> : null}
    </Screen>
  );
}
