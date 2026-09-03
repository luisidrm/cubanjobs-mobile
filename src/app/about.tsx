import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

const VALUE_KEYS = ["clearDirection", "verifiedTrust", "builtForCuba", "openDoors"] as const;

export default function AboutScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("about.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.wordmark}>Brújula</Text>
        <Text style={styles.tagline}>{t("about.tagline")}</Text>
        <Text style={styles.mission}>{t("about.mission")}</Text>

        {VALUE_KEYS.map((key, i) => (
          <View key={key} style={styles.valueCard}>
            <Text style={styles.valueNum}>{String(i + 1).padStart(2, "0")}</Text>
            <Text style={styles.valueTitle}>{t(`about.values.${key}.title`)}</Text>
            <Text style={styles.valueBody}>{t(`about.values.${key}.body`)}</Text>
          </View>
        ))}
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
  body: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  wordmark: { fontSize: 34, color: colors.accent, fontFamily: "InstrumentSerif_400Regular" },
  tagline: {
    fontSize: 17, color: colors.textSecondary, marginTop: 4, marginBottom: 18,
    fontFamily: "InstrumentSerif_400Regular_Italic",
  },
  mission: { fontSize: 14.5, color: colors.chipText, lineHeight: 21, marginBottom: 28 },
  valueCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18, marginBottom: 12,
    borderWidth: 1, borderColor: colors.chipBorder,
  },
  valueNum: { fontSize: 12, fontFamily: "IBMPlexMono_500Medium", color: colors.accent, marginBottom: 8 },
  valueTitle: { fontSize: 17, fontFamily: "InstrumentSerif_400Regular", color: colors.textPrimary, marginBottom: 6 },
  valueBody: { fontSize: 13.5, color: colors.textSecondary, lineHeight: 19 },
});
