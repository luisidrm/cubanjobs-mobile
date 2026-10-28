import { ChevronLeft } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTokens } from "../../theme/use-tokens";
import { Button } from "./Button";
import { GlassView } from "./GlassView";
import { IconButton } from "./IconButton";

function Dot({ active }: { active: boolean }) {
  const p = useTokens();
  const style = useAnimatedStyle(() => ({
    width: withSpring(active ? 22 : 7, { damping: 16, stiffness: 240, mass: 0.7 }),
  }));
  return <Animated.View style={[{ height: 7, borderRadius: 4, backgroundColor: active ? p.accent : p.fill3 }, style]} />;
}

export interface OnboardingHeaderProps {
  step: number;
  total: number;
  onBack?: () => void;
  onSkip: () => void;
  backLabel: string;
  skipLabel: string;
  skipDisabled?: boolean;
}

/** Sticky 56pt header: back (hidden on step 1) / progress dots / skip, on light glass. */
export function OnboardingHeader({ step, total, onBack, onSkip, backLabel, skipLabel, skipDisabled }: OnboardingHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <GlassView strength="thin" intensity={40} radius={0} shadow={false} style={{ paddingTop: insets.top, borderWidth: 0 }}>
      <View
        style={{ height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "transparent" }}
      >
        <View style={{ width: 120, alignItems: "flex-start" }}>
          {onBack ? <IconButton icon={ChevronLeft} label={backLabel} variant="fill" onPress={onBack} /> : null}
        </View>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: total, now: step + 1 }}
          style={{ flex: 1, flexDirection: "row", justifyContent: "center", gap: 6 }}
        >
          {Array.from({ length: total }).map((_, i) => (
            <Dot key={i} active={i === step} />
          ))}
        </View>
        <View style={{ width: 120, alignItems: "flex-end" }}>
          <Button size="sm" variant="plain" title={skipLabel} onPress={onSkip} disabled={skipDisabled} />
        </View>
      </View>
    </GlassView>
  );
}
