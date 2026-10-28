import { forwardRef } from "react";
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";
import { fontFamily, typography, type Palette, type TextVariant } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";

export type TextTone = "primary" | "secondary" | "tertiary" | "accent" | "danger" | "success" | "onAccent";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  /** Override the variant's weight (e.g. headline at bold). */
  weight?: "regular" | "medium" | "semibold" | "bold";
  mono?: boolean;
  /** Tabular figures, for prices and counters. */
  tabular?: boolean;
}

function toneColor(p: Palette, tone: TextTone): string {
  switch (tone) {
    case "secondary":
      return p.text2;
    case "tertiary":
      return p.text3;
    case "accent":
      return p.accentText;
    case "danger":
      return p.dangerText;
    case "success":
      return p.successText;
    case "onAccent":
      return p.onAccent;
    default:
      return p.text1;
  }
}

/** Typography primitive: every on-screen string should go through this. */
export const Text = forwardRef<RNText, TextProps>(function Text(
  { variant = "body", tone = "primary", weight, mono, tabular, style, children, ...rest },
  ref,
) {
  const p = useTokens();
  const spec = typography[variant];
  const w = weight ?? spec.weight;
  const family = mono
    ? w === "regular"
      ? fontFamily.monoRegular
      : fontFamily.monoMedium
    : fontFamily[w];
  const base: TextStyle = {
    fontFamily: family,
    fontSize: spec.size,
    lineHeight: spec.line,
    letterSpacing: spec.tracking,
    color: toneColor(p, tone),
    ...(tabular ? { fontVariant: ["tabular-nums"] } : null),
  };
  return (
    <RNText ref={ref} style={[base, style]} {...rest}>
      {spec.uppercase && typeof children === "string" ? children.toUpperCase() : children}
    </RNText>
  );
});
