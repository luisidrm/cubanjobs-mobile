import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { useTokens } from "../../theme/use-tokens";

export interface ScreenProps {
  children: ReactNode;
  /** Apply the top safe-area inset. Turn off when a NavBar already does. */
  safeTop?: boolean;
  /** Soft accent wash at the top so glass has something to refract. */
  wash?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** App background (bg-app) plus the one soft radial wash of accent-soft the system allows. */
export function Screen({ children, safeTop = true, wash = true, style }: ScreenProps) {
  const p = useTokens();
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ flex: 1, backgroundColor: p.bgApp, paddingTop: safeTop ? insets.top : 0 }, style]}>
      {wash ? (
        <View style={[StyleSheet.absoluteFill, { height: 360, pointerEvents: "none" }]}>
          <Svg width="100%" height="100%">
            <Defs>
              <RadialGradient id="wash" cx="50%" cy="0%" rx="90%" ry="100%" fx="50%" fy="0%">
                <Stop offset="0" stopColor={p.accent} stopOpacity={p.blurTint === "dark" ? 0.18 : 0.14} />
                <Stop offset="1" stopColor={p.accent} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#wash)" />
          </Svg>
        </View>
      ) : null}
      {children}
    </View>
  );
}
