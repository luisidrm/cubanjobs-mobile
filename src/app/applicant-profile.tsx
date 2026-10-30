import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Link2, MapPin, MessageCircle, WifiOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useSkillLabel } from "../lib/skills";
import { ActivityIndicator, Linking, ScrollView, View } from "react-native";
import { useGetPublicProfileQuery } from "../../store/api/usersApi";
import { Button, Card, Icon, List, ListRow, NavBar, Screen, Text, CardSkeletons, EmptyState } from "../components/ds";
import { SkillChip } from "../components/users/SkillChip";
import { useTokens } from "../theme/use-tokens";

export default function ApplicantProfileScreen() {
  const { t } = useTranslation();
  const skillLabel = useSkillLabel();
  const p = useTokens();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { data: profile, isLoading, isError, refetch } = useGetPublicProfileQuery(userId);

  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || t("applicantProfile.unnamed")
    : "";
  const initials = profile ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase() : "";

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("applicantProfile.title")} />

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <CardSkeletons />
        </View>
      ) : null}

      {isError && !isLoading ? (
        <EmptyState icon={WifiOff} tone="danger" message={t("applicantProfile.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
      ) : null}

      {!isLoading && !isError && profile ? (
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 24 }}>
          <View style={{ alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: p.accentSoft,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {profile.profilePictureUrl ? (
                <Image source={{ uri: profile.profilePictureUrl }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Text variant="title1" tone="accent">
                  {initials}
                </Text>
              )}
            </View>
            <Text variant="title1" accessibilityRole="header" style={{ textAlign: "center" }}>
              {fullName}
            </Text>
            {profile.location ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icon icon={MapPin} size={14} color={p.text3} />
                <Text variant="subhead" tone="secondary">
                  {profile.location}
                </Text>
              </View>
            ) : null}
          </View>

          {profile.bio ? (
            <View style={{ gap: 8 }}>
              <Text variant="title3">{t("applicantProfile.about")}</Text>
              <Text variant="body" tone="secondary">
                {profile.bio}
              </Text>
            </View>
          ) : null}

          {profile.linkedinUrl || profile.phone ? (
            <List>
              {profile.linkedinUrl ? (
                <ListRow
                  icon={Link2}
                  iconBg="#0A66C2"
                  title={t("applicantProfile.viewLinkedin")}
                  accessory="chevron"
                  onPress={() => Linking.openURL(profile.linkedinUrl as string)}
                />
              ) : null}
              {profile.phone ? (
                <ListRow
                  icon={MessageCircle}
                  iconBg="#25D366"
                  title={t("jobApplicants.contactWhatsapp")}
                  accessory="chevron"
                  onPress={() => Linking.openURL(`https://wa.me/${(profile.phone as string).replace(/\D/g, "")}`)}
                />
              ) : null}
            </List>
          ) : null}

          {profile.skills.length > 0 ? (
            <View style={{ gap: 12 }}>
              <Text variant="title3">{t("applicantProfile.skills")}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {profile.skills.map((s) => (
                  <SkillChip key={s.id} label={skillLabel(s.skill)} />
                ))}
              </View>
            </View>
          ) : null}

          {profile.experience.length > 0 ? (
            <View style={{ gap: 12 }}>
              <Text variant="title3">{t("applicantProfile.experience")}</Text>
              {profile.experience.map((exp) => (
                <Card key={exp.id} variant="grouped" padding={14} radius={16}>
                  <Text variant="headline">{exp.title}</Text>
                  {exp.organization ? (
                    <Text variant="subhead" tone="secondary">
                      {exp.organization}
                    </Text>
                  ) : null}
                  {exp.description ? (
                    <Text variant="footnote" tone="secondary" style={{ marginTop: 6 }}>
                      {exp.description}
                    </Text>
                  ) : null}
                </Card>
              ))}
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </Screen>
  );
}
