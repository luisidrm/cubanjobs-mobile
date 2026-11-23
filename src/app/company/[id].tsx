import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Building2, Link2, MapPin, WifiOff } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { useGetCompanyByIdQuery } from "../../../store/api/companiesApi";
import { useSearchJobsQuery } from "../../../store/api/jobsApi";
import { JobCard } from "../../components/Jobs/JobCard";
import { Icon, List, ListRow, NavBar, Screen, Text, CardSkeletons, EmptyState } from "../../components/ds";
import { useTokens } from "../../theme/use-tokens";
import { openExternal } from "../../lib/openExternal";

export default function CompanyScreen() {
  const { t } = useTranslation();
  const p = useTokens();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: company, isLoading, isError, refetch } = useGetCompanyByIdQuery(id);
  const { data: openJobs, isLoading: jobsLoading } = useSearchJobsQuery({ companyId: id, limit: 50 });

  return (
    <Screen safeTop={false}>
      <NavBar back title={t("companyView.title")} />

      {isLoading ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <CardSkeletons />
        </View>
      ) : null}

      {isError && !isLoading ? (
        <EmptyState icon={WifiOff} tone="danger" message={t("companyView.error")} actionLabel={t("jobDetails.retry")} onAction={() => refetch()} />
      ) : null}

      {!isLoading && !isError && company ? (
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40, gap: 24 }}>
          <View style={{ alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: 24,
                backgroundColor: p.accentSoft,
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {company.logoUrl ? (
                <Image source={{ uri: company.logoUrl }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <Icon icon={Building2} size={32} color={p.accent} />
              )}
            </View>
            <Text variant="title1" style={{ textAlign: "center" }} accessibilityRole="header">
              {company.name}
            </Text>
            {company.location ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Icon icon={MapPin} size={14} color={p.text3} />
                <Text variant="subhead" tone="secondary">
                  {company.location}
                </Text>
              </View>
            ) : null}
          </View>

          {company.description ? (
            <View style={{ gap: 8 }}>
              <Text variant="title3">{t("companyView.about")}</Text>
              <Text variant="body" tone="secondary">
                {company.description}
              </Text>
            </View>
          ) : null}

          <List>
            {company.website ? (
              <ListRow
                icon={Link2}
                title={company.website}
                accessory="chevron"
                onPress={() => openExternal(company.website as string, t("common.cantOpenLink"))}
              />
            ) : null}
            {company.industry ? <ListRow title={t("companyView.industry")} value={company.industry} /> : null}
            {company.employeeCount ? <ListRow title={t("companyView.size")} value={company.employeeCount} /> : null}
          </List>

          <View style={{ gap: 12 }}>
            <Text variant="title3">{t("companyView.openJobsTitle")}</Text>
            {jobsLoading ? <CardSkeletons /> : null}
            {!jobsLoading && (openJobs?.length ?? 0) === 0 ? (
              <Text variant="subhead" tone="secondary">
                {t("companyView.noOpenJobs")}
              </Text>
            ) : null}
            {openJobs?.map((job) => (
              <JobCard key={job.id} job={job} onPress={() => router.push({ pathname: "/job/[id]", params: { id: job.id } })} />
            ))}
          </View>
        </ScrollView>
      ) : null}
    </Screen>
  );
}
