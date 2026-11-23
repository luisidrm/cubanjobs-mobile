import { useLocalSearchParams, useRouter } from "expo-router";
import { MailCheck, MailX } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useResendVerificationEmailMutation, useVerifyEmailMutation } from "../../store/api/authApi";
import { useGetMeQuery } from "../../store/api/usersApi";
import { StatusScreen } from "../components/ds";
import { showErrorToast, showSuccessToast } from "../lib/toast";
import { homeFor } from "../lib/home";

type VerifyState = "verifying" | "success" | "invalid";

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [state, setState] = useState<VerifyState>(token ? "verifying" : "invalid");
  const [verifyEmail] = useVerifyEmailMutation();
  const [resend] = useResendVerificationEmailMutation();
  const { data: me } = useGetMeQuery();
  const homeRoute = homeFor(me?.role);

  useEffect(() => {
    if (!token) return;

    verifyEmail({ token })
      .unwrap()
      .then((response) => {
        setState(response.status === "OK" ? "success" : "invalid");
      })
      .catch(() => setState("invalid"));
    // Runs once per mount for the token in the deep link — re-submitting on
    // every render would burn through the (single-use) verification token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleResend() {
    try {
      await resend().unwrap();
      showSuccessToast(t("verifyBanner.resent"));
    } catch {
      showErrorToast(t("verifyEmail.genericError"));
    }
  }

  if (state === "verifying") {
    return <StatusScreen spinner message={t("verifyEmail.verifying")} />;
  }

  if (state === "success") {
    return (
      <StatusScreen
        icon={MailCheck}
        tone="success"
        title={t("verifyEmail.successTitle")}
        message={t("verifyEmail.successMessage")}
        primary={{ title: t("verifyEmail.continue"), onPress: () => router.replace(homeRoute) }}
      />
    );
  }

  return (
    <StatusScreen
      icon={MailX}
      tone="danger"
      title={t("verifyEmail.invalidTitle")}
      message={t("verifyEmail.invalidMessage")}
      primary={{ title: t("verifyBanner.resend"), onPress: handleResend }}
      secondary={{ title: t("forgotPassword.backToSignIn"), onPress: () => router.replace("/login") }}
    />
  );
}
