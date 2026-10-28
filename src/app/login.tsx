import { Redirect, useRouter } from "expo-router";
import { Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useSignInMutation } from "../../store/api/authApi";
import { useGetMeQuery, useLazyGetMeQuery } from "../../store/api/usersApi";
import { setAuth } from "../../store/slices/authSlice";
import { AuthScreen } from "../components/auth/AuthScreen";
import { Button, DangerBanner, Text, TextField } from "../components/ds";
import { useSession } from "../lib/session";
import { homeFor } from "../lib/home";

type Status = "idle" | "submitting" | "wrong" | "generic";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status: session } = useSession();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const [signIn] = useSignInMutation();
  const [triggerGetMe] = useLazyGetMeQuery();
  // Only fires for the "already had a session on app launch" branch below —
  // handleSignIn fetches its own fresh copy via triggerGetMe instead, since
  // right after signing in this cached query may not have run yet.
  const { data: me } = useGetMeQuery(undefined, { skip: session !== "authenticated" });

  if (session === "authenticated") {
    if (!me) return null;
    return <Redirect href={homeFor(me.role)} />;
  }

  async function handleSignIn() {
    setStatus("submitting");
    try {
      const response = await signIn({ email, password }).unwrap();

      if (response.status === "OK") {
        dispatch(setAuth({ supertokensUserId: response.user.id, email: response.user.emails[0] }));
        const user = await triggerGetMe().unwrap();
        router.push(homeFor(user.role));
        setStatus("idle");
      } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
        setStatus("wrong");
      } else {
        setStatus("generic");
      }
    } catch {
      setStatus("generic");
    }
  }

  return (
    <AuthScreen
      brand
      back={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      backLabel={t("common.back", { defaultValue: "Back" })}
      footer={
        <>
          <Text variant="subhead" tone="secondary">
            {t("login.noAccount")}
          </Text>
          <Button variant="plain" size="sm" title={t("login.signUpLink")} onPress={() => router.push("/sign-up")} />
        </>
      }
    >
      {status === "generic" ? <DangerBanner message={t("login.genericError")} /> : null}
      <TextField
        value={email}
        onChangeText={setEmail}
        icon={Mail}
        placeholder={t("login.emailPlaceholder")}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        value={password}
        onChangeText={setPassword}
        icon={Lock}
        placeholder={t("login.passwordPlaceholder")}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSignIn}
        error={status === "wrong" ? t("login.wrongCredentials") : undefined}
      />
      <Button block size="lg" title={t("login.signIn")} loading={status === "submitting"} onPress={handleSignIn} style={{ marginTop: 4 }} />
      <Button block variant="plain" title={t("login.forgotPasswordLink")} onPress={() => router.push("/forgot-password")} />
    </AuthScreen>
  );
}
