import { Image } from "expo-image";
import { BadgeCheck, Bookmark, BookmarkCheck, MapPin } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTokens } from "../../theme/use-tokens";
import type { Job } from "../../types/job";
import { CompanyLogo } from "../company/CompanyLogo";
import { Badge, Card, Icon, IconButton, Text } from "../ds";

interface Props {
  job: Job;
  onPress: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

function formatSalary(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  const fmt = (n: number) => n.toLocaleString();
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

/** Job card: optional cover image, company logo tile, title + company, bookmark; salary + currency (mono), location, Remote badge. */
export function JobCard({ job, onPress, isSaved, onToggleSave }: Props) {
  const { t } = useTranslation();
  const p = useTokens();
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Card onPress={onPress} accessibilityLabel={job.title} padding={0} style={{ marginBottom: 14, overflow: "hidden" }}>
      {job.coverImageUrl ? (
        <Image
          source={{ uri: job.coverImageUrl }}
          style={{ width: "100%", height: 140, backgroundColor: p.fill2 }}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
      ) : null}
      <View style={{ padding: 16, gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <CompanyLogo name={job.company?.name} logoUrl={job.company?.logoUrl} />

        <View style={{ flex: 1, minWidth: 0 }}>
          <Text weight="semibold" numberOfLines={1} style={{ fontSize: 16, lineHeight: 21 }}>
            {job.title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text variant="subhead" tone="secondary" numberOfLines={1} style={{ flexShrink: 1 }}>
              {job.company?.name ?? ""}
            </Text>
            {job.company?.isVerified ? (
              <View accessible accessibilityLabel={t("explore.verifiedCompany")}>
                <Icon icon={BadgeCheck} size={16} color={p.accent} />
              </View>
            ) : null}
          </View>
        </View>

        {onToggleSave ? (
          <IconButton
            icon={isSaved ? BookmarkCheck : Bookmark}
            variant={isSaved ? "primary" : "plain"}
            label={isSaved ? t("job.unsave", { defaultValue: "Unsave" }) : t("job.save", { defaultValue: "Save" })}
            onPress={onToggleSave}
          />
        ) : null}
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        {salary ? (
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, flexShrink: 1 }}>
            <Text weight="semibold" tabular style={{ fontSize: 16, lineHeight: 22 }}>
              {salary}
            </Text>
            {job.currency ? (
              <Text mono weight="medium" tone="secondary" style={{ fontSize: 12, lineHeight: 16 }}>
                {job.currency}
              </Text>
            ) : null}
          </View>
        ) : (
          <View />
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
          {job.location ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}>
              <Icon icon={MapPin} size={14} color={p.text3} />
              <Text variant="footnote" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
                {job.location}
              </Text>
            </View>
          ) : null}
          {job.isRemote ? (
            <Badge tone="accent" size="sm">
              {t("explore.remote")}
            </Badge>
          ) : null}
        </View>
      </View>
      </View>
    </Card>
  );
}
