import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useGetMyCompaniesQuery } from "../../store/api/companiesApi";
import {
  useCreateJobMutation,
  useDeleteJobMutation,
  useGetJobsByCompanyQuery,
  useUpdateJobMutation,
} from "../../store/api/jobsApi";
import { FilterChip } from "../components/tabs/FilterChip";
import { SegmentedControl } from "../components/application/SegmentedControl";
import { colors } from "../theme/colors";
import type { Currency, JobStatus, JobType } from "../types/job";

const JOB_TYPES: JobType[] = ["full_time", "part_time", "contract", "freelance", "internship"];
const CURRENCIES: Currency[] = ["CUP", "MLC", "USD"];
const STATUSES: { key: JobStatus; label: string }[] = [
  { key: "draft", label: "Draft" },
  { key: "active", label: "Active" },
  { key: "closed", label: "Closed" },
  { key: "expired", label: "Expired" },
];

export default function JobFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = Boolean(id);

  const { data: companies } = useGetMyCompaniesQuery();
  const company = companies?.[0];

  const { data: myJobs, isLoading: jobsLoading } = useGetJobsByCompanyQuery(company?.id ?? "", { skip: !company });
  const existingJob = isEdit ? myJobs?.find((j) => j.id === id) : undefined;

  const [createJob, { isLoading: creating }] = useCreateJobMutation();
  const [updateJob, { isLoading: updating }] = useUpdateJobMutation();
  const [deleteJob, { isLoading: deleting }] = useDeleteJobMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState<Currency>("CUP");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<JobType | undefined>(undefined);
  const [isRemote, setIsRemote] = useState(false);
  const [status, setStatus] = useState<JobStatus>("draft");

  useEffect(() => {
    if (!existingJob) return;
    setTitle(existingJob.title);
    setDescription(existingJob.description);
    setSalaryMin(existingJob.salaryMin != null ? String(existingJob.salaryMin) : "");
    setSalaryMax(existingJob.salaryMax != null ? String(existingJob.salaryMax) : "");
    setCurrency(existingJob.currency ?? "CUP");
    setLocation(existingJob.location ?? "");
    setJobType(existingJob.jobType ?? undefined);
    setIsRemote(existingJob.isRemote);
    setStatus(existingJob.status);
  }, [existingJob]);

  const saving = creating || updating;

  async function handleSave() {
    if (!title.trim() || !description.trim()) {
      Alert.alert(t("jobForm.requiredFields"));
      return;
    }
    if (!company) {
      Alert.alert(t("jobForm.noCompany"));
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
      salaryMax: salaryMax ? Number(salaryMax) : undefined,
      currency,
      location: location.trim() || undefined,
      jobType,
      isRemote,
      status,
    };

    try {
      if (isEdit && id) {
        await updateJob({ id, ...payload }).unwrap();
      } else {
        await createJob({ companyId: company.id, ...payload }).unwrap();
      }
      router.back();
    } catch {
      Alert.alert(t("jobForm.saveError"));
    }
  }

  function handleDelete() {
    if (!id) return;
    Alert.alert(t("jobForm.confirmDeleteTitle"), t("jobForm.confirmDeleteMessage"), [
      { text: t("jobDetails.cancel"), style: "cancel" },
      {
        text: t("jobForm.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteJob(id).unwrap();
            router.back();
          } catch {
            Alert.alert(t("jobForm.saveError"));
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEdit ? t("jobForm.editTitle") : t("jobForm.createTitle")}</Text>
        {isEdit ? (
          <Pressable onPress={handleDelete} hitSlop={12} disabled={deleting}>
            {deleting ? <ActivityIndicator size="small" color="#D64545" /> : <Ionicons name="trash-outline" size={22} color="#D64545" />}
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {isEdit && jobsLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.label}>{t("jobForm.jobTitle")}</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={t("jobForm.jobTitlePlaceholder")} placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>{t("jobForm.description")}</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={description}
              onChangeText={setDescription}
              placeholder={t("jobForm.descriptionPlaceholder")}
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>{t("jobForm.salaryMin")}</Text>
                <TextInput style={styles.input} value={salaryMin} onChangeText={setSalaryMin} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>{t("jobForm.salaryMax")}</Text>
                <TextInput style={styles.input} value={salaryMax} onChangeText={setSalaryMax} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} />
              </View>
            </View>

            <Text style={styles.label}>{t("jobForm.currency")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CURRENCIES.map((c) => (
                <FilterChip key={c} label={c} active={currency === c} onPress={() => setCurrency(c)} />
              ))}
            </ScrollView>

            <Text style={styles.label}>{t("jobForm.jobType")}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {JOB_TYPES.map((jt) => (
                <FilterChip key={jt} label={t(`jobType.${jt}`)} active={jobType === jt} onPress={() => setJobType(jt)} />
              ))}
            </ScrollView>

            <Text style={styles.label}>{t("jobForm.location")}</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder={t("jobForm.locationPlaceholder")} placeholderTextColor={colors.textMuted} />

            <View style={styles.switchRow}>
              <Text style={styles.label}>{t("jobForm.remote")}</Text>
              <Switch value={isRemote} onValueChange={setIsRemote} trackColor={{ true: colors.accent, false: "#E2E2E6" }} />
            </View>

            <Text style={styles.label}>{t("jobForm.status")}</Text>
            <SegmentedControl options={STATUSES} value={status} onChange={(k) => setStatus(k as JobStatus)} />

            <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.saveButtonText}>{isEdit ? t("jobForm.saveChanges") : t("jobForm.publish")}</Text>}
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
  multiline: { minHeight: 100, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  saveButton: {
    backgroundColor: colors.accent, borderRadius: 999, paddingVertical: 16,
    alignItems: "center", marginTop: 28,
  },
  saveButtonText: { color: colors.surface, fontWeight: "800", fontSize: 15 },
});
