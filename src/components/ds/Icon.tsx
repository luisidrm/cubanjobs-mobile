import type { LucideIcon } from "lucide-react-native";
import { useTokens } from "../../theme/use-tokens";

export interface IconProps {
  /** A lucide-react-native icon component, e.g. `import { Search } from "lucide-react-native"`. */
  icon: LucideIcon;
  /** 16 meta · 18 list tiles/inputs · 20 default · 22 tab bar. */
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Lucide outline icon (2px stroke, rounded joins), tinted with the primary text color by default. */
export function Icon({ icon: Glyph, size = 20, color, strokeWidth = 2 }: IconProps) {
  const p = useTokens();
  return <Glyph size={size} color={color ?? p.text1} strokeWidth={strokeWidth} />;
}
