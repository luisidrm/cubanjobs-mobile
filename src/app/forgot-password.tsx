import { useRouter } from "expo-router";
import { KeyRound, Mail, MailCheck } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRequestPasswordResetMutation } from "../../store/api/authApi";
import { AuthScreen } from "../components/auth/AuthScreen";
import { Button, DangerBanner, StatusScreen, TextField } from "../components/ds";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const [requestPasswordReset] = useRequestPasswordResetMutation();

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const response = await requestPasswordReset({ email }).unwrap();
      if (response.status === "OK") {
        setSent(true);
      } else {
        setError(response.formFields[0]?.error ?? t("forgotPassword.genericError"));
      }
    } catch {
      setError(t("forgotPassword.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <StatusScreen
        icon={MailCheck}
        tone="success"
        title={t("forgotPassword.successTitle")}
        message={t("forgotPassword.successMessage")}
        primary={{ title: t("forgotPassword.backToSignIn"), onPress: () => router.replace("/login") }}
      />
    );
  }

  return (
    <AuthScreen
      back
      backLabel={t("common.back", { defaultValue: "Back" })}
      icon={KeyRound}
      title={t("forgotPassword.title")}
      subtitle={t("forgotPassword.subtitle")}
    >
      {error ? <DangerBanner message={error} /> : null}
      <TextField
        value={email}
        onChangeText={setEmail}
        icon={Mail}
        placeholder={t("forgotPassword.emailPlaceholder")}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <Button block size="lg" title={t("forgotPassword.submit")} loading={submitting} onPress={handleSubmit} />
    </AuthScreen>
  );
}
