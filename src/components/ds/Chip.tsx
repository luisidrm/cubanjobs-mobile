import { Check, X } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { radius } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export interface ChipProps {
  label: string;
  /**
   * selectable: 40pt, fill when off, accent + check when on (onboarding skills).
   * filter: 36pt, white hairline when off, accent when on (search filters).
   * removable: 36pt white hairline with a trailing x (selected summary).
   */
  variant?: "selectable" | "filter" | "removable";
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  removeLabel?: string;
  disabled?: boolean;
}

export function Chip({ label, variant = "selectable", selected, onPress, onRemove, removeLabel, disabled }: ChipProps) {
  const p = useTokens();

  if (variant === "removable") {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          height: 36,
          paddingLeft: 14,
          paddingRight: 6,
          borderRadius: radius.pill,
          backgroundColor: p.surfaceCard,
          borderWidth: 1,
          borderColor: p.separator,
        }}
      >
        <Text variant="subhead" weight="semibold">
          {label}
        </Text>
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={removeLabel ?? label}
          style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center" }}
        >
          <Icon icon={X} size={15} color={p.text3} />
        </Pressable>
      </View>
    );
  }

  const selectable = variant === "selectable";
  const on = !!selected;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected: on, disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      pressScale={0.95}
      hitSlop={selectable ? 2 : { top: 4, bottom: 4 }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        height: selectable ? 40 : 36,
        paddingHorizontal: selectable ? 15 : 16,
        borderRadius: radius.pill,
        backgroundColor: on ? p.accent : selectable ? p.fill1 : p.surfaceCard,
        borderWidth: !selectable && !on ? 1 : 0,
        borderColor: p.separator,
      }}
    >
      {selectable && on ? <Icon icon={Check} size={15} color={p.onAccent} /> : null}
      <Text weight="semibold" style={{ fontSize: 14, lineHeight: 16, color: on ? p.onAccent : p.text1 }}>
        {label}
      </Text>
    </PressableScale>
  );
}
