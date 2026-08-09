import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGetPublicProfileQuery } from "../../store/api/usersApi";
import { SkillChip } from "../components/users/SkillChip";
import { colors } from "../theme/colors";

export default function ApplicantProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data: profile, isLoading, isError, refetch } = useGetPublicProfileQuery(userId);

  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || t("applicantProfile.unnamed")
    : "";
  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("applicantProfile.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {isError && !isLoading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{t("applicantProfile.error")}</Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryText}>{t("jobDetails.retry")}</Text>
          </Pressable>
        </View>
      )}

      {!isLoading && !isError && profile && (
        <ScrollView contentContainerStyle={styles.body}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              {profile.profilePictureUrl ? (
                <Image source={{ uri: profile.profilePictureUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <Text style={styles.name}>{fullName}</Text>
            {profile.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.location}>{profile.location}</Text>
              </View>
            )}
          </View>

          {profile.bio && (
            <>
              <Text style={styles.sectionTitle}>{t("applicantProfile.about")}</Text>
              <Text style={styles.bio}>{profile.bio}</Text>
            </>
          )}

          {profile.linkedinUrl && (
            <Pressable style={styles.linkRow} onPress={() => Linking.openURL(profile.linkedinUrl!)}>
              <Ionicons name="logo-linkedin" size={18} color="#0A66C2" />
              <Text style={styles.linkText}>{t("applicantProfile.viewLinkedin")}</Text>
            </Pressable>
          )}

          {profile.phone && (
            <Pressable
              style={styles.linkRow}
              onPress={() => Linking.openURL(`https://wa.me/${profile.phone!.replace(/\D/g, "")}`)}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={styles.linkText}>{t("jobApplicants.contactWhatsapp")}</Text>
            </Pressable>
          )}

          {profile.skills.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{t("applicantProfile.skills")}</Text>
              <View style={styles.skillsWrap}>
                {profile.skills.map((s) => (
                  <SkillChip key={s.id} label={s.skill} />
                ))}
              </View>
            </>
          )}

          {profile.experience.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>{t("applicantProfile.experience")}</Text>
              {profile.experience.map((exp) => (
                <View key={exp.id} style={styles.experienceCard}>
                  <Text style={styles.experienceTitle}>{exp.title}</Text>
                  {exp.organization && <Text style={styles.experienceOrg}>{exp.organization}</Text>}
                  {exp.description && <Text style={styles.experienceDescription}>{exp.description}</Text>}
                </View>
              ))}
            </>
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
  headerTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
  headerSpacer: { width: 26 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  errorText: { color: colors.textSecondary, fontSize: 14 },
  retryButton: { backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: colors.surface, fontWeight: "700", fontSize: 13 },
  body: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  profileCard: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: colors.textPrimary,
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: colors.accent, fontWeight: "800", fontSize: 24 },
  name: { fontSize: 19, fontWeight: "800", color: colors.textPrimary, marginTop: 12 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  location: { fontSize: 13, color: colors.textSecondary },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.textPrimary, marginTop: 24, marginBottom: 10 },
  bio: { fontSize: 14, color: colors.chipText, lineHeight: 20 },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  linkText: { fontWeight: "700", fontSize: 14, color: colors.textPrimary },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap" },
  experienceCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: "#EEEEF0",
  },
  experienceTitle: { fontWeight: "700", fontSize: 14, color: colors.textPrimary },
  experienceOrg: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  experienceDescription: { fontSize: 13, color: colors.chipText, marginTop: 6, lineHeight: 18 },
});
