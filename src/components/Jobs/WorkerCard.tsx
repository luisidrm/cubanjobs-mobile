import { ChevronRight, MapPin } from "lucide-react-native";
import { View } from "react-native";
import { useTokens } from "../../theme/use-tokens";
import type { WorkerSummary } from "../../types/user";
import { Card, Icon, Text } from "../ds";
import { SkillChip } from "../users/SkillChip";

interface Props {
  worker: WorkerSummary;
  onPress: () => void;
}

/** Same anatomy as the job card: 44pt initial tile, name + location, chevron; bio and up to 3 skills below. */
export function WorkerCard({ worker, onPress }: Props) {
  const p = useTokens();
  const name = [worker.firstName, worker.lastName].filter(Boolean).join(" ") || "?";

  return (
    <Card onPress={onPress} accessibilityLabel={name} padding={16} style={{ gap: 14, marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: p.accentSoft, alignItems: "center", justifyContent: "center" }}>
          <Text weight="bold" tone="accent" style={{ fontSize: 18, lineHeight: 22 }}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text weight="semibold" numberOfLines={1} style={{ fontSize: 16, lineHeight: 21 }}>
            {name}
          </Text>
          {worker.location ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Icon icon={MapPin} size={14} color={p.text3} />
              <Text variant="footnote" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
                {worker.location}
              </Text>
            </View>
          ) : null}
        </View>
        <Icon icon={ChevronRight} size={18} color={p.text3} />
      </View>

      {worker.bio ? (
        <Text variant="subhead" tone="secondary" numberOfLines={2}>
          {worker.bio}
        </Text>
      ) : null}

      {worker.skills.length > 0 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {worker.skills.slice(0, 3).map((s) => (
            <SkillChip key={s.id} label={s.skill} />
          ))}
        </View>
      ) : null}
    </Card>
  );
}
