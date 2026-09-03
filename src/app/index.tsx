import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSignInMutation } from "../../store/api/authApi";
import { useGetMeQuery, useLazyGetMeQuery } from "../../store/api/usersApi";
import { useSession } from "../lib/session";
import { colors } from "../theme/colors";

import { BrujulaAppIcon } from "@/components/Brujula";
import { useDispatch } from "react-redux";
import { setAuth } from "../../store/slices/authSlice";

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status } = useSession();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [signIn] = useSignInMutation()
  const [triggerGetMe] = useLazyGetMeQuery();
  // Only fires for the "already had a session on app launch" branch below —
  // handleSignIn fetches its own fresh copy via triggerGetMe instead, since
  // right after signing in this cached query may not have run yet.
  const { data: me } = useGetMeQuery(undefined, { skip: status !== "authenticated" });

  // Already logged in on app launch — skip straight to the tabs, landing on
  // the right home tab for the role (employer home is /my-jobs, not /jobs).
  if (status === "authenticated") {
    if (!me) return null;
    return <Redirect href={me.role === "employer" ? "/my-jobs" : "/jobs"} />;
  }

  async function handleSignIn() {
    setError(null);
    setSubmitting(true);
    try {
      const response = await signIn({ email, password }).unwrap();

      if (response.status === "OK") {
        dispatch(setAuth({
          supertokensUserId: response.user.id,
          email: response.user.emails[0],
        }));

        const me = await triggerGetMe().unwrap();
        router.push(me.role === "employer" ? "/my-jobs" : "/jobs");
      } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
        setError(t("login.wrongCredentials"));
      } else {
        setError(t("login.genericError"));
      }
    } catch {
      setError(t("login.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <BrujulaAppIcon style = {styles.logoBadge}/>
        <Text style={styles.brandName}>Brújula</Text>
        <Text style={styles.brandTagline}>Tu norte profesional.</Text>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("login.emailPlaceholder") as string}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("login.passwordPlaceholder") as string}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={styles.button}
            onPress={handleSignIn}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.buttonText}>{t("login.signIn")}</Text>
            )}
          </Pressable>

          <Pressable style={styles.linkRow} onPress={() => router.push("/forgot-password")}>
            <Text style={styles.linkAccent}>{t("login.forgotPasswordLink")}</Text>
          </Pressable>

          <Pressable style={styles.linkRow} onPress={() => router.push("/sign-up")}>
            <Text style={styles.linkText}>
              {t("login.noAccount")} <Text style={styles.linkAccent}>{t("login.signUpLink")}</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoLetter: { color: colors.accent, fontWeight: "800", fontSize: 26, fontFamily: "InstrumentSerif_400Regular" },
  brandName: { color: colors.textPrimary, fontSize: 40, fontFamily: "InstrumentSerif_400Regular", marginTop: 4 },
  brandTagline: {
    color: colors.textSecondary,
    fontSize: 16,
    fontFamily: "InstrumentSerif_400Regular_Italic",
    marginTop: 4,
    marginBottom: 36,
  },
  form: { width: "100%", maxWidth: 360, gap: 14 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: "#EEEEF0",
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
  error: { color: "#D64545", fontSize: 13, textAlign: "center" },
  linkRow: { alignItems: "center", marginTop: 4 },
  linkText: { color: colors.textSecondary, fontSize: 13 },
  linkAccent: { color: colors.accent, fontWeight: "700", fontSize: 13 },
});