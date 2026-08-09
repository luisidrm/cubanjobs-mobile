import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";
import type { WorkExperience } from "../../types/user";

export interface ExperienceFormValues {
  title: string;
  organization: string;
  description: string;
  contact: string;
}

interface Props {
  initial?: WorkExperience;
  submitting: boolean;
  onSubmit: (values: ExperienceFormValues) => void;
  onCancel: () => void;
}

export function ExperienceForm({ initial, submitting, onSubmit, onCancel }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [organization, setOrganization] = useState(initial?.organization ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [contact, setContact] = useState(initial?.contact ?? "");

  const canSubmit = title.trim().length > 0 && !submitting;

  return (
    <View style={styles.card}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={t("profile.workExperience.titlePlaceholder") as string}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={organization}
        onChangeText={setOrganization}
        placeholder={t("profile.workExperience.organizationPlaceholder") as string}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder={t("profile.workExperience.descriptionPlaceholder") as string}
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        style={[styles.input, styles.multiline]}
      />
      <TextInput
        value={contact}
        onChangeText={setContact}
        placeholder={t("profile.workExperience.contactPlaceholder") as string}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <Text style={styles.contactHint}>{t("profile.workExperience.contactHint")}</Text>

      <View style={styles.actionsRow}>
        <Pressable style={styles.cancelButton} onPress={onCancel} disabled={submitting}>
          <Text style={styles.cancelText}>{t("profile.workExperience.cancel")}</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
          onPress={() => onSubmit({ title: title.trim(), organization: organization.trim(), description: description.trim(), contact: contact.trim() })}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.surface} />
          ) : (
            <Text style={styles.saveText}>{t("profile.workExperience.save")}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EEEEF0",
    marginBottom: 10,
    gap: 10,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 70, textAlignVertical: "top" },
  contactHint: { fontSize: 11, color: colors.textMuted },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 4 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { fontWeight: "700", fontSize: 13, color: colors.textSecondary },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
});
