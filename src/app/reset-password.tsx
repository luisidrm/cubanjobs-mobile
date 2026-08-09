import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useSubmitNewPasswordMutation } from "../../store/api/authApi";
import { colors } from "../theme/colors";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  const [submitNewPassword] = useSubmitNewPasswordMutation();

  async function handleSubmit() {
    setError(null);

    if (!token) {
      setInvalidToken(true);
      return;
    }
    if (password !== confirmPassword) {
      setError(t("resetPassword.mismatchError"));
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("resetPassword.invalidToken")}</Text>
          <Pressable style={styles.button} onPress={() => router.replace("/forgot-password")}>
            <Text style={styles.buttonText}>{t("resetPassword.requestNewLink")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("resetPassword.successTitle")}</Text>
          <Text style={styles.subtitle}>{t("resetPassword.successMessage")}</Text>
          <Pressable style={styles.button} onPress={() => router.replace("/")}>
            <Text style={styles.buttonText}>{t("resetPassword.continueToSignIn")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>{t("resetPassword.title")}</Text>
        <Text style={styles.subtitle}>{t("resetPassword.subtitle")}</Text>

        <View style={styles.form}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("resetPassword.newPasswordPlaceholder") as string}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("resetPassword.confirmPasswordPlaceholder") as string}
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            style={styles.input}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.buttonText}>{t("resetPassword.submit")}</Text>
            )}
          </Pressable>
        </View>
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
});
