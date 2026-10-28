import { Redirect, useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useSignUpMutation } from "../../store/api/authApi";
import { useGetMeQuery } from "../../store/api/usersApi";
import { setAuth } from "../../store/slices/authSlice";
import { AuthScreen } from "../components/auth/AuthScreen";
import { Button, DangerBanner, SegmentedControl, Text, TextField } from "../components/ds";
import { useSession } from "../lib/session";
import { homeFor } from "../lib/home";

type Role = "employee" | "employer";
type Status = "idle" | "mismatch" | "server" | "submitting";

export default function SignUpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status: session } = useSession();
  const dispatch = useDispatch();

  const [role, setRole] = useState<Role>("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const [signUp] = useSignUpMutation();
  const { data: me } = useGetMeQuery(undefined, { skip: session !== "authenticated" });

  if (session === "authenticated") {
    if (!me) return null;
    return <Redirect href={homeFor(me.role)} />;
  }

  async function handleSignUp() {
    setServerMessage(null);

    if (password !== confirmPassword) {
      setStatus("mismatch");
      return;
    }

    setStatus("submitting");
    try {
      const response = await signUp({ email, password, role }).unwrap();

      if (response.status === "OK") {
        dispatch(setAuth({ supertokensUserId: response.user.id, email: response.user.emails[0] }));
        router.replace(role === "employer" ? "/my-jobs" : "/jobs");
      } else if (response.status === "FIELD_ERROR") {
        setServerMessage(response.formFields[0]?.error ?? t("signUp.genericError"));
        setStatus("server");
      } else {
        setStatus("idle");
      }
    } catch {
      setServerMessage(t("signUp.genericError"));
      setStatus("server");
    }
  }

  return (
    <AuthScreen
      back
      backLabel={t("common.back", { defaultValue: "Back" })}
      title={t("signUp.title")}
      subtitle={t("signUp.roleQuestion")}
      largeTitle
      footer={
        <>
          <Text variant="subhead" tone="secondary">
            {t("signUp.haveAccount")}
          </Text>
          <Button variant="plain" size="sm" title={t("signUp.signInLink")} onPress={() => router.replace("/login")} />
        </>
      }
    >
      <SegmentedControl<Role>
        value={role}
        onChange={setRole}
        options={[
          { value: "employee", label: t("signUp.roleEmployee") },
          { value: "employer", label: t("signUp.roleEmployer") },
        ]}
      />
      {status === "server" && serverMessage ? <DangerBanner message={serverMessage} /> : null}
      <TextField
        value={email}
        onChangeText={setEmail}
        icon={Mail}
        placeholder={t("signUp.emailPlaceholder")}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        value={password}
        onChangeText={setPassword}
        icon={Lock}
        placeholder={t("signUp.passwordPlaceholder")}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <TextField
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        icon={Lock}
        placeholder={t("signUp.confirmPasswordPlaceholder")}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        error={status === "mismatch" ? t("signUp.mismatchError") : undefined}
      />
      <Button block size="lg" title={t("signUp.submit")} loading={status === "submitting"} onPress={handleSignUp} style={{ marginTop: 4 }} />
    </AuthScreen>
  );
}
