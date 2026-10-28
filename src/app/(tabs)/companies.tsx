import { useRouter } from "expo-router";
import { BadgeCheck, Building2, MapPin, Search, WifiOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, View } from "react-native";
import { useSearchCompaniesQuery } from "../../../store/api/companiesApi";
import { CompanyLogo } from "../../components/company/CompanyLogo";
import { Badge, Card, CardSkeletons, EmptyState, Icon, NavBar, Screen, Text, TextField } from "../../components/ds";
import { NotificationBell } from "../../components/notifications/NotificationBell";
import { TAB_BAR_CLEARANCE } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import type { PublicCompany } from "../../types/company";

function CompanyRow({ company, onPress }: { company: PublicCompany; onPress: () => void }) {
  const { t } = useTranslation();
  const p = useTokens();
  return (
    <Card onPress={onPress} accessibilityLabel={company.name} padding={16} style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <CompanyLogo name={company.name} logoUrl={company.logoUrl} size={52} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text weight="semibold" numberOfLines={1} style={{ fontSize: 16, lineHeight: 21, flexShrink: 1 }}>
              {company.name}
            </Text>
            {company.isVerified ? <Icon icon={BadgeCheck} size={16} color={p.accent} /> : null}
          </View>
          {company.industry ? (
            <Text variant="subhead" tone="secondary" numberOfLines={1}>
              {company.industry}
            </Text>
          ) : null}
          {company.location ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Icon icon={MapPin} size={13} color={p.text3} />
              <Text variant="footnote" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
                {company.location}
              </Text>
            </View>
          ) : null}
        </View>
        {company.openJobs > 0 ? <Badge tone="accent">{t("companies.openJobs", { count: company.openJobs })}</Badge> : null}
      </View>
    </Card>
  );
}

export default function CompaniesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [text, setText] = useState("");
  const [q, setQ] = useState("");

  // Wait for a pause in typing before querying.
  useEffect(() => {
    const id = setTimeout(() => setQ(text.trim()), 300);
    return () => clearTimeout(id);
  }, [text]);

  const { data, isLoading, isFetching, isError, refetch } = useSearchCompaniesQuery({ q: q || undefined, limit: 50 });

  return (
    <Screen safeTop={false}>
      <NavBar large title={t("companies.title")} trailing={<NotificationBell />} />
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <TextField
          icon={Search}
          placeholder={t("companies.searchPlaceholder")}
          value={text}
          onChangeText={setText}
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel={t("companies.searchPlaceholder")}
        />
      </View>

      {isLoading ? (
        <View style={{ paddingHorizontal: 16 }}>
          <CardSkeletons />
        </View>
      ) : (
        <FlatList showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          data={data ?? []}
          keyExtractor={(c) => c.id}
          keyboardShouldPersistTaps="handled"
          refreshing={isFetching}
          onRefresh={refetch}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: TAB_BAR_CLEARANCE }}
          renderItem={({ item }) => (
            <CompanyRow company={item} onPress={() => router.push({ pathname: "/company/[id]", params: { id: item.id } })} />
          )}
          ListEmptyComponent={
            isError ? (
              <EmptyState icon={WifiOff} tone="danger" message={t("companies.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
            ) : (
              <EmptyState icon={Building2} message={t("companies.empty")} />
            )
          }
        />
      )}
    </Screen>
  );
}
