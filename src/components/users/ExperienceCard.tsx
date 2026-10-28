import { Pencil, Trash2 } from "lucide-react-native";
import { View } from "react-native";
import type { WorkExperience } from "../../types/user";
import { Card, IconButton, Text } from "../ds";

interface Props {
  experience: WorkExperience;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExperienceCard({ experience, onEdit, onDelete }: Props) {
  return (
    <Card variant="grouped" padding={14} radius={16} style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text variant="headline">{experience.title}</Text>
          {experience.organization ? (
            <Text variant="subhead" tone="secondary">
              {experience.organization}
            </Text>
          ) : null}
          {experience.description ? (
            <Text variant="footnote" tone="secondary" numberOfLines={3} style={{ marginTop: 6 }}>
              {experience.description}
            </Text>
          ) : null}
        </View>
        <IconButton icon={Pencil} label="Edit" variant="plain" size={36} onPress={onEdit} />
        <IconButton icon={Trash2} label="Delete" variant="plain" size={36} onPress={onDelete} />
      </View>
    </Card>
  );
}
