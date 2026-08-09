import { useRouter } from "expo-router";
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
import { useRequestPasswordResetMutation } from "../../store/api/authApi";
import { colors } from "../theme/colors";

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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("forgotPassword.title")}</Text>

        {sent ? (
          <>
            <Text style={styles.subtitle}>{t("forgotPassword.successMessage")}</Text>
            <Pressable style={styles.button} onPress={() => router.replace("/")}>
              <Text style={styles.buttonText}>{t("forgotPassword.backToSignIn")}</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.form}>
            <Text style={styles.subtitle}>{t("forgotPassword.subtitle")}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("forgotPassword.emailPlaceholder") as string}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.buttonText}>{t("forgotPassword.submit")}</Text>
              )}
            </Pressable>

            <Pressable style={styles.linkRow} onPress={() => router.replace("/")}>
              <Text style={styles.linkAccent}>{t("forgotPassword.backToSignIn")}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: "center", marginBottom: 20, lineHeight: 20 },
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
    width: "100%",
    maxWidth: 360,
  },
  buttonText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
  error: { color: "#D64545", fontSize: 13, textAlign: "center" },
  linkRow: { alignItems: "center", marginTop: 4 },
  linkAccent: { color: colors.accent, fontWeight: "700", fontSize: 13 },
});
