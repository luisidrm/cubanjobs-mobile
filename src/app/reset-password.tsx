import { useLocalSearchParams, useRouter } from "expo-router";
import { Link2Off, Lock, LockKeyhole, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSubmitNewPasswordMutation } from "../../store/api/authApi";
import { AuthScreen } from "../components/auth/AuthScreen";
import { Button, DangerBanner, StatusScreen, TextField } from "../components/ds";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  const [submitNewPassword] = useSubmitNewPasswordMutation();

  async function handleSubmit() {
    setError(null);
    setMismatch(false);

    if (!token) {
      setInvalidToken(true);
      return;
    }
    if (password !== confirmPassword) {
      setMismatch(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitNewPassword({ token, password }).unwrap();
      if (response.status === "OK") {
        setDone(true);
      } else if (response.status === "RESET_PASSWORD_INVALID_TOKEN_ERROR") {
        setInvalidToken(true);
      } else {
        setError(response.formFields[0]?.error ?? t("resetPassword.genericError"));
      }
    } catch {
      setError(t("resetPassword.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  if (invalidToken) {
    return (
      <StatusScreen
        icon={Link2Off}
        tone="danger"
        title={t("resetPassword.invalidToken")}
        message={t("resetPassword.subtitle")}
        primary={{ title: t("resetPassword.requestNewLink"), onPress: () => router.replace("/forgot-password") }}
        secondary={{ title: t("forgotPassword.backToSignIn"), onPress: () => router.replace("/login") }}
      />
    );
  }

  if (done) {
    return (
      <StatusScreen
        icon={ShieldCheck}
        tone="success"
        title={t("resetPassword.successTitle")}
        message={t("resetPassword.successMessage")}
        primary={{ title: t("resetPassword.continueToSignIn"), onPress: () => router.replace("/login") }}
      />
    );
  }

  return (
    <AuthScreen
      back={() => (router.canGoBack() ? router.back() : router.replace("/login"))}
      backLabel={t("common.back", { defaultValue: "Back" })}
      icon={LockKeyhole}
      title={t("resetPassword.title")}
      subtitle={t("resetPassword.subtitle")}
    >
      {error ? <DangerBanner message={error} /> : null}
      <TextField
        value={password}
        onChangeText={setPassword}
        icon={Lock}
        placeholder={t("resetPassword.newPasswordPlaceholder")}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        icon={Lock}
        placeholder={t("resetPassword.confirmPasswordPlaceholder")}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={mismatch ? t("resetPassword.mismatchError") : undefined}
      />
      <Button block size="lg" title={t("resetPassword.submit")} loading={submitting} onPress={handleSubmit} />
    </AuthScreen>
  );
}
