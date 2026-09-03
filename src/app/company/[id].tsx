import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGetCompanyByIdQuery } from "../../../store/api/companiesApi";
import { colors } from "../../theme/colors";

export default function CompanyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: company, isLoading, isError, refetch } = useGetCompanyByIdQuery(id);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("companyView.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("companyView.error")}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>{t("jobDetails.retry")}</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && company && (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.profileCard}>
            <View style={styles.logo}>
              {company.logoUrl ? (
                <Image source={{ uri: company.logoUrl }} style={styles.logoImage} />
              ) : (
                <Ionicons name="business" size={28} color={colors.accent} />
              )}
            </View>
            <Text style={styles.name}>{company.name}</Text>
            {company.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.location}>{company.location}</Text>
              </View>
            )}
          </View>

          {company.description && (
            <>
              <Text style={styles.sectionTitle}>{t("companyView.about")}</Text>
              <Text style={styles.paragraph}>{company.description}</Text>
            </>
          )}

          {company.website && (
            <Pressable style={styles.linkRow} onPress={() => Linking.openURL(company.website!)}>
              <Ionicons name="link-outline" size={18} color={colors.accent} />
              <Text style={styles.linkText}>{company.website}</Text>
            </Pressable>
          )}

          {company.industry && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("companyView.industry")}</Text>
              <Text style={styles.detailValue}>{company.industry}</Text>
            </View>
          )}

          {company.employeeCount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t("companyView.size")}</Text>
              <Text style={styles.detailValue}>{company.employeeCount}</Text>
            </View>
          )}
        </ScrollView>
      )}
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
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  retryButton: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  profileCard: { alignItems: "center", marginBottom: 20 },
  logo: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: colors.accentSoft,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  logoImage: { width: "100%", height: "100%" },
  name: { fontSize: 19, fontWeight: "800", color: colors.textPrimary, marginTop: 12 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  location: { fontSize: 13, color: colors.textSecondary },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, marginTop: 24, marginBottom: 10 },
  paragraph: { fontSize: 14, color: colors.chipText, lineHeight: 20 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 18 },
  linkText: { fontWeight: "700", fontSize: 14, color: colors.accent },
  detailRow: { marginTop: 18 },
  detailLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, letterSpacing: 0.5 },
  detailValue: { fontSize: 15, color: colors.textPrimary, marginTop: 4 },
});
