import { useTranslation } from "react-i18next";
import { ScrollView } from "react-native";
import { NavBar, Screen, Text } from "../components/ds";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("profile.privacyPolicy.title")} />

      <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 }}>
        <Text variant="callout" tone="secondary" style={{ lineHeight: 24 }}>
          {t("profile.privacyPolicy.body")}
        </Text>
      </ScrollView>
    </Screen>
  );
}
