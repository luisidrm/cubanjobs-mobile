import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("profile.privacyPolicy.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.paragraph}>{t("profile.privacyPolicy.body")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: colors.surface,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, fontFamily: "InstrumentSerif_400Regular" },
  headerSpacer: { width: 26 },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  paragraph: { fontSize: 14, color: colors.chipText, lineHeight: 22 },
});
