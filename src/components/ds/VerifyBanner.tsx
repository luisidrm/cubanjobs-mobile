import { MailWarning } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useGetEmailVerificationStatusQuery, useResendVerificationEmailMutation } from "../../../store/api/authApi";
import { useTokens } from "../../theme/use-tokens";
import { Button } from "./Button";
import { Card } from "./Card";
import { Icon } from "./Icon";
import { Text } from "./Text";

/** Unverified-email notice shown on home tabs: warning tile, copy, Resend (becomes "Sent" once used). */
export function VerifyBanner() {
  const { t } = useTranslation();
  const p = useTokens();
  const { data: verification } = useGetEmailVerificationStatusQuery();
  const [resend, { isLoading }] = useResendVerificationEmailMutation();
  const [sent, setSent] = useState(false);

  if (verification?.isVerified !== false) return null;

  async function handle() {
    try {
      await resend().unwrap();
      setSent(true);
    } catch {
      // Best-effort — user can just tap again.
    }
  }

  return (
    <Card padding={14} radius={16}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: p.warningSoft, alignItems: "center", justifyContent: "center" }}>
          <Icon icon={MailWarning} size={20} color={p.warningText} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="subhead" weight="semibold">
            {t("verifyBanner.title")}
          </Text>
          <Text variant="footnote" tone="secondary">
            {t("verifyBanner.subtitle")}
          </Text>
        </View>
        <Button
          size="sm"
          variant="secondary"
          title={sent ? t("verifyBanner.resent") : t("verifyBanner.resend")}
          loading={isLoading}
          disabled={sent}
          onPress={handle}
        />
      </View>
    </Card>
  );
}
