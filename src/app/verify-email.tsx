import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useVerifyEmailMutation } from "../../store/api/authApi";
import { colors } from "../theme/colors";

type VerifyState = "verifying" | "success" | "invalid";

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [state, setState] = useState<VerifyState>("verifying");
  const [verifyEmail] = useVerifyEmailMutation();

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {state === "verifying" && (
          <>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.subtitle}>{t("verifyEmail.verifying")}</Text>
          </>
        )}

        {state === "success" && (
          <>
            <Text style={styles.title}>{t("verifyEmail.successTitle")}</Text>
            <Text style={styles.subtitle}>{t("verifyEmail.successMessage")}</Text>
            <Pressable style={styles.button} onPress={() => router.replace("/jobs")}>
              <Text style={styles.buttonText}>{t("verifyEmail.continue")}</Text>
            </Pressable>
          </>
        )}

        {state === "invalid" && (
          <>
            <Text style={styles.title}>{t("verifyEmail.invalidTitle")}</Text>
            <Text style={styles.subtitle}>{t("verifyEmail.invalidMessage")}</Text>
            <Pressable style={styles.button} onPress={() => router.replace("/jobs")}>
              <Text style={styles.buttonText}>{t("verifyEmail.continue")}</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 14 },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", textAlign: "center" },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: "center", lineHeight: 20 },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: colors.surface, fontWeight: "700", fontSize: 15 },
});
