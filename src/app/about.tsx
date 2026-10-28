import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { BrandMark, Card, NavBar, Screen, Text } from "../components/ds";

const VALUE_KEYS = ["clearDirection", "verifiedTrust", "builtForCuba", "openDoors"] as const;

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("about.title")} />

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40, gap: 24 }}>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <BrandMark size={48} />
            <Text accessibilityRole="header" weight="bold" style={{ fontSize: 40, lineHeight: 44, letterSpacing: -0.04 * 40 }}>
              Brújula
            </Text>
          </View>
          <Text variant="title3" tone="secondary" weight="medium">
            {t("about.tagline")}
          </Text>
        </View>
        <Text variant="body" tone="secondary">
          {t("about.mission")}
        </Text>

        <View style={{ gap: 12 }}>
          {VALUE_KEYS.map((key) => (
            <Card key={key} style={{ gap: 6 }}>
              <Text variant="headline">{t(`about.values.${key}.title`)}</Text>
              <Text variant="subhead" tone="secondary">
                {t(`about.values.${key}.body`)}
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
