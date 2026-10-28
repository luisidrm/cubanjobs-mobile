import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ImagePlus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useGetMyCompaniesQuery } from "../../store/api/companiesApi";
import {
  useCreateJobMutation,
  useDeleteJobImageMutation,
  useDeleteJobMutation,
  useUploadJobImageMutation,
  useGetJobsByCompanyQuery,
  useUpdateJobMutation,
} from "../../store/api/jobsApi";
import { AlertDialog, Button, IconButton, List, ListRow, NavBar, Screen, SegmentedControl, Text, TextField, Toggle, ACTION_BAR_CLEARANCE, GlassActionBar } from "../components/ds";
import { FilterChip } from "../components/tabs/FilterChip";
import { getErrorMessage } from "../lib/errors";
import { appendFilePart } from "../lib/upload";
import { showErrorToast } from "../lib/toast";
import { useTokens } from "../theme/use-tokens";
import type { Currency, JobStatus, JobType } from "../types/job";
import { goBack } from "../lib/navigation";

const JOB_TYPES: JobType[] = ["full_time", "part_time", "contract", "freelance", "internship"];
const CURRENCIES: Currency[] = ["CUP", "MLC", "USD"];
const STATUSES: { value: JobStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
  { value: "expired", label: "Expired" },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text variant="footnote" weight="medium" tone="secondary" style={{ paddingLeft: 4, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

export default function JobFormScreen() {
  const { t } = useTranslation();
  const p = useTokens();
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
  const [uploadJobImage] = useUploadJobImageMutation();
  const [deleteJobImage] = useDeleteJobImageMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState<Currency>("CUP");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState<JobType | undefined>(undefined);
  const [isRemote, setIsRemote] = useState(false);
  const [status, setStatus] = useState<JobStatus>("draft");
  const [confirmDelete, setConfirmDelete] = useState(false);
  // Cover image: a newly picked file is uploaded after the job saves; "removed" deletes the stored one.
  const [pickedCover, setPickedCover] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [coverRemoved, setCoverRemoved] = useState(false);
  const coverPreview = pickedCover?.uri ?? (coverRemoved ? null : (existingJob?.coverImageUrl ?? null));

  async function handlePickCover() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (result.canceled) return;
    setPickedCover(result.assets[0]);
    setCoverRemoved(false);
  }

  async function syncCover(jobId: string) {
    try {
      if (pickedCover) {
        const ext = pickedCover.mimeType?.split("/")[1] ?? "jpg";
        const formData = new FormData();
        await appendFilePart(formData, "file", {
          uri: pickedCover.uri,
          name: pickedCover.fileName ?? `cover.${ext}`,
          mimeType: pickedCover.mimeType ?? "image/jpeg",
          webFile: pickedCover.file,
        });
        await uploadJobImage({ jobId, formData }).unwrap();
      } else if (coverRemoved && existingJob?.coverImageUrl) {
        await deleteJobImage(jobId).unwrap();
      }
    } catch {
      // The job itself is saved; only the picture failed.
      showErrorToast(t("jobForm.coverError"));
    }
  }

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
      showErrorToast(t("jobForm.requiredFields"));
      return;
    }
    if (!company) {
      showErrorToast(t("jobForm.noCompany"));
      return;
    }

    const parsedSalaryMin = salaryMin.trim() ? Number(salaryMin) : undefined;
    const parsedSalaryMax = salaryMax.trim() ? Number(salaryMax) : undefined;
    if (
      (parsedSalaryMin !== undefined && !Number.isFinite(parsedSalaryMin)) ||
      (parsedSalaryMax !== undefined && !Number.isFinite(parsedSalaryMax))
    ) {
      showErrorToast(t("jobForm.invalidSalary"));
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      currency,
      location: location.trim() || undefined,
      jobType,
      isRemote,
      status,
    };

    try {
      if (isEdit && id) {
        await updateJob({ id, ...payload }).unwrap();
        await syncCover(id);
      } else {
        const created = await createJob({ companyId: company.id, ...payload }).unwrap();
        await syncCover(created.id);
      }
      goBack(router);
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("jobForm.saveError")));
    }
  }

  async function doDelete() {
    if (!id) return;
    try {
      await deleteJob(id).unwrap();
      goBack(router);
    } catch (err) {
      showErrorToast(getErrorMessage(err, t("jobForm.saveError")));
    }
  }

  return (
    <Screen safeTop={false}>
      <NavBar
        back
        title={isEdit ? t("jobForm.editTitle") : t("jobForm.createTitle")}
        trailing={
          isEdit ? (
            deleting ? (
              <ActivityIndicator color={p.danger} />
            ) : (
              <IconButton icon={Trash2} label={t("jobForm.delete")} variant="fill" onPress={() => setConfirmDelete(true)} />
            )
          ) : undefined
        }
      />

      {isEdit && jobsLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={p.accent} />
        </View>
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: ACTION_BAR_CLEARANCE, gap: 20 }}>
            <TextField label={t("jobForm.jobTitle")} value={title} onChangeText={setTitle} placeholder={t("jobForm.jobTitlePlaceholder")} />

            <TextField
              label={t("jobForm.description")}
              value={description}
              onChangeText={setDescription}
              placeholder={t("jobForm.descriptionPlaceholder")}
              multiline
              rows={5}
            />

            <View>
              <FieldLabel>{t("jobForm.coverImage")}</FieldLabel>
              {coverPreview ? (
                <Image source={{ uri: coverPreview }} style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: p.fill2 }} contentFit="cover" />
              ) : null}
              <View style={{ flexDirection: "row", gap: 8, marginTop: coverPreview ? 10 : 0 }}>
                <Button size="sm" variant="secondary" icon={ImagePlus} title={coverPreview ? t("jobForm.changeCover") : t("jobForm.addCover")} onPress={handlePickCover} />
                {coverPreview ? (
                  <Button
                    size="sm"
                    variant="plain"
                    title={t("jobForm.removeCover")}
                    onPress={() => {
                      setPickedCover(null);
                      setCoverRemoved(true);
                    }}
                  />
                ) : null}
              </View>
              <Text variant="footnote" tone="tertiary" style={{ paddingLeft: 4, marginTop: 6 }}>
                {t("jobForm.coverHelp")}
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextField containerStyle={{ flex: 1 }} label={t("jobForm.salaryMin")} value={salaryMin} onChangeText={setSalaryMin} keyboardType="numeric" placeholder="0" />
              <TextField containerStyle={{ flex: 1 }} label={t("jobForm.salaryMax")} value={salaryMax} onChangeText={setSalaryMax} keyboardType="numeric" placeholder="0" />
            </View>

            <View>
              <FieldLabel>{t("jobForm.currency")}</FieldLabel>
              <ScrollView showsVerticalScrollIndicator={false} horizontal showsHorizontalScrollIndicator={false}>
                {CURRENCIES.map((c) => (
                  <FilterChip key={c} label={c} active={currency === c} onPress={() => setCurrency(c)} />
                ))}
              </ScrollView>
            </View>

            <View>
              <FieldLabel>{t("jobForm.jobType")}</FieldLabel>
              <ScrollView showsVerticalScrollIndicator={false} horizontal showsHorizontalScrollIndicator={false}>
                {JOB_TYPES.map((jt) => (
                  <FilterChip key={jt} label={t(`jobType.${jt}`)} active={jobType === jt} onPress={() => setJobType(jt)} />
                ))}
              </ScrollView>
            </View>

            <TextField label={t("jobForm.location")} value={location} onChangeText={setLocation} placeholder={t("jobForm.locationPlaceholder")} />

            <List>
              <ListRow
                title={t("jobForm.remote")}
                accessory={<Toggle label={t("jobForm.remote")} value={isRemote} onValueChange={setIsRemote} />}
              />
            </List>

            <View>
              <FieldLabel>{t("jobForm.status")}</FieldLabel>
              <SegmentedControl<JobStatus> options={STATUSES} value={status} onChange={setStatus} size="sm" />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      )}

      <GlassActionBar>
        <Button
          block
          size="lg"
          title={isEdit ? t("jobForm.saveChanges") : t("jobForm.publish")}
          loading={saving}
          onPress={handleSave}
        />
      </GlassActionBar>

      <AlertDialog
        open={confirmDelete}
        title={t("jobForm.confirmDeleteTitle")}
        message={t("jobForm.confirmDeleteMessage")}
        onClose={() => setConfirmDelete(false)}
        actions={[
          { label: t("jobDetails.cancel"), style: "cancel" },
          { label: t("jobForm.delete"), style: "destructive", onPress: () => void doDelete() },
        ]}
      />
    </Screen>
  );
}
