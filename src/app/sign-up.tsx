import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { useSignUpMutation } from "../../store/api/authApi";
import { setAuth } from "../../store/slices/authSlice";
import { SegmentedControl } from "../components/application/SegmentedControl";
import { useSession } from "../lib/session";
import { colors } from "../theme/colors";

export default function SignUpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { status } = useSession();
  const dispatch = useDispatch();

  const [role, setRole] = useState<"employee" | "employer">("employee");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [signUp] = useSignUpMutation();

  if (status === "authenticated") return <Redirect href="/jobs" />;

  async function handleSignUp() {
    setError(null);

    if (password !== confirmPassword) {
      setError(t("signUp.mismatchError"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await signUp({ email, password, role }).unwrap();

      if (response.status === "OK") {
        dispatch(setAuth({
          supertokensUserId: response.user.id,
          email: response.user.emails[0],
        }));
        router.replace("/jobs");
      } else if (response.status === "FIELD_ERROR") {
        setError(response.formFields[0]?.error ?? t("signUp.genericError"));
      }
    } catch {
      setError(t("signUp.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoLetter}>C</Text>
        </View>
        <Text style={styles.brandName}>{t("signUp.title")}</Text>

        <View style={styles.form}>
          <SegmentedControl
            value={role}
            onChange={(k) => setRole(k as "employee" | "employer")}
            options={[
              { key: "employee", label: t("signUp.roleEmployee") },
              { key: "employer", label: t("signUp.roleEmployer") },
            ]}
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("signUp.emailPlaceholder") as string}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("signUp.passwordPlaceholder") as string}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("signUp.confirmPasswordPlaceholder") as string}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.button} onPress={handleSignUp} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.buttonText}>{t("signUp.submit")}</Text>
            )}
          </Pressable>

          <Pressable style={styles.linkRow} onPress={() => router.replace("/")}>
            <Text style={styles.linkText}>
              {t("signUp.haveAccount")} <Text style={styles.linkAccent}>{t("signUp.signInLink")}</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoLetter: { color: colors.accent, fontWeight: "800", fontSize: 26 },
  brandName: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", marginBottom: 28 },
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
  linkAccent: { color: colors.accent, fontWeight: "700" },
});
