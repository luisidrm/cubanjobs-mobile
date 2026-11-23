import type { LucideIcon } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { layout, radius } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { GlassView } from "./GlassView";
import { Icon } from "./Icon";
import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

// Structural subset of expo-router's BottomTabBarProps, so this file doesn't
// depend on an @react-navigation import path (not allowed since SDK 56).
export interface FloatingTabBarProps {
  state: { index: number; routes: { key: string; name: string; params?: object }[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarLabel?: unknown;
        tabBarBadge?: number | string;
        tabBarItemStyle?: unknown;
        tabBarAccessibilityLabel?: string;
        tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
      };
    }
  >;
  navigation: {
    emit: (e: { type: "tabPress" | "tabLongPress"; target?: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
}

/** Per-route icon registry: screens pass lucide components via this map. */
export type TabIcons = Record<string, LucideIcon>;

function isHidden(style: unknown): boolean {
  const flat = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : (style as { display?: string } | undefined);
  return !!flat && (flat as { display?: string }).display === "none";
}

/** Floating glass pill tab bar, 20 above the bottom edge, 3-5 items. Hidden routes (href: null) are skipped. */
export function FloatingTabBar({ state, descriptors, navigation, icons }: FloatingTabBarProps & { icons: TabIcons }) {
  const p = useTokens();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ position: "absolute", left: 16, right: 16, bottom: Math.max(insets.bottom, 0) + layout.tabBarOffset - (insets.bottom > 0 ? 8 : 0) , pointerEvents: "box-none" }}
    >
      <GlassView radius={radius.pill} strength="regular" intensity={70} style={{ flexDirection: "row", padding: 6 }}>
        {state.routes.map((route, i) => {
          const { options } = descriptors[route.key]!;
          if (isHidden(options.tabBarItemStyle)) return null;
          const focused = state.index === i;
          const label = typeof options.tabBarLabel === "string" ? options.tabBarLabel : (options.title ?? route.name);
          const glyph = icons[route.name];
          const fg = focused ? p.accentText : p.text2;
          return (
            <PressableScale
              key={route.key}
              accessibilityRole="tab"
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
              }}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              style={{
                flex: 1,
                height: 52,
                borderRadius: radius.pill,
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                backgroundColor: focused ? p.accentSoft : "transparent",
              }}
            >
              {glyph ? <Icon icon={glyph} size={22} color={fg} /> : null}
              <Text weight={focused ? "semibold" : "medium"} numberOfLines={1} style={{ fontSize: 11, lineHeight: 13, color: fg, letterSpacing: 0 }}>
                {label}
              </Text>
              {options.tabBarBadge != null ? (
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    left: "50%",
                    marginLeft: 6,
                    minWidth: 16,
                    height: 16,
                    paddingHorizontal: 4,
                    borderRadius: 8,
                    backgroundColor: p.accent,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text weight="bold" style={{ fontSize: 10, lineHeight: 12, color: p.onAccent }}>
                    {options.tabBarBadge}
                  </Text>
                </View>
              ) : null}
            </PressableScale>
          );
        })}
      </GlassView>
    </View>
  );
}
