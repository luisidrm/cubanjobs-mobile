import { Image } from "expo-image";
import { View } from "react-native";
import { useTokens } from "../../theme/use-tokens";
import { Text } from "../ds";

interface Props {
  name: string | null | undefined;
  logoUrl: string | null | undefined;
  size?: number;
  radius?: number;
}

/** Company logo tile; falls back to the company's initial on the accent tint. */
export function CompanyLogo({ name, logoUrl, size = 44, radius }: Props) {
  const p = useTokens();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? Math.round(size * 0.27),
        backgroundColor: p.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={{ width: "100%", height: "100%" }} contentFit="cover" accessibilityIgnoresInvertColors />
      ) : (
        <Text weight="bold" tone="accent" style={{ fontSize: Math.round(size * 0.4), lineHeight: Math.round(size * 0.5) }}>
          {(name ?? "?").charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}
