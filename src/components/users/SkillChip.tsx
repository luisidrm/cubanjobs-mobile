import { Plus } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { radius } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { Chip, Icon, PressableScale, Text } from "../ds";

/** Read-only skill pill (accent-soft), or the removable chip (white, hairline, x) when `onRemove` is given. */
export function SkillChip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  const p = useTokens();
  const { t } = useTranslation();
  if (onRemove) {
    return (
      <Chip variant="removable" label={label} onRemove={onRemove} removeLabel={`${t("onboarding.remove")} ${label}`} />
    );
  }
  return (
    <Text
      weight="semibold"
      style={{
        fontSize: 14,
        lineHeight: 20,
        color: p.accentText,
        backgroundColor: p.accentSoft,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: radius.pill,
        overflow: "hidden",
      }}
    >
      {label}
    </Text>
  );
}

export function AddSkillChip({ onPress }: { onPress: () => void }) {
  const p = useTokens();
  const { t } = useTranslation();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      pressScale={0.95}
      hitSlop={4}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: 36,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        backgroundColor: p.fill1,
      }}
    >
      <Icon icon={Plus} size={16} color={p.text2} />
      <Text variant="subhead" weight="semibold" tone="secondary">
        {t("profile.addSkill", { defaultValue: "Add skill" })}
      </Text>
    </PressableScale>
  );
}
