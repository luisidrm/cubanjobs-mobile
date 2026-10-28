import { KeyRound } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useJoinCompanyMutation } from "../../../store/api/companiesApi";
import { showErrorToast, showSuccessToast } from "../../lib/toast";
import { Button, TextField } from "../ds";

interface Props {
  onJoined?: (companyId: string) => void;
}

/** Enter a teammate's invite code to join their company (no payment: their plan covers you). */
export function JoinCompany({ onJoined }: Props) {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [join, { isLoading }] = useJoinCompanyMutation();

  async function submit() {
    const trimmed = code.trim();
    if (trimmed.length < 4) return;
    try {
      const company = await join(trimmed).unwrap();
      showSuccessToast(t("join.success", { company: company.name }));
      setCode("");
      onJoined?.(company.id);
    } catch (err) {
      const e = err as { status?: number; data?: { details?: { code?: string } } };
      if (e?.status === 404) showErrorToast(t("join.invalid"));
      else if (e?.status === 409) showErrorToast(t("join.already"));
      else if (e?.status === 403 && e.data?.details?.code === "SEAT_LIMIT_REACHED") showErrorToast(t("join.full"));
      else showErrorToast(t("join.error"));
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <TextField
        icon={KeyRound}
        label={t("join.title")}
        hint={t("join.subtitle")}
        placeholder={t("join.placeholder")}
        value={code}
        onChangeText={(v) => setCode(v.toUpperCase())}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={16}
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Button block title={t("join.action")} loading={isLoading} disabled={code.trim().length < 4} onPress={submit} />
    </View>
  );
}
