import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import type { WorkExperience } from "../../types/user";
import { Button, Card, TextField } from "../ds";

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
    <Card variant="grouped" padding={14} radius={16} style={{ marginBottom: 10, gap: 12 }}>
      <TextField value={title} onChangeText={setTitle} placeholder={t("profile.workExperience.titlePlaceholder")} />
      <TextField
        value={organization}
        onChangeText={setOrganization}
        placeholder={t("profile.workExperience.organizationPlaceholder")}
      />
      <TextField
        value={description}
        onChangeText={setDescription}
        placeholder={t("profile.workExperience.descriptionPlaceholder")}
        multiline
        rows={3}
      />
      <TextField
        value={contact}
        onChangeText={setContact}
        placeholder={t("profile.workExperience.contactPlaceholder")}
        hint={t("profile.workExperience.contactHint")}
      />

      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="tinted" title={t("profile.workExperience.cancel")} onPress={onCancel} disabled={submitting} />
        <Button
          title={t("profile.workExperience.save")}
          loading={submitting}
          disabled={!canSubmit}
          onPress={() =>
            onSubmit({
              title: title.trim(),
              organization: organization.trim(),
              description: description.trim(),
              contact: contact.trim(),
            })
          }
        />
      </View>
    </Card>
  );
}
