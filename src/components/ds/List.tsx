import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { radius } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { Text } from "./Text";

export interface ListProps {
  /** Small uppercase header above the group. */
  header?: string;
  footer?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Inset grouped list: rounded card with hairline separators, holds ListRow children. */
export function List({ header, footer, children, style }: ListProps) {
  const p = useTokens();
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={[{ gap: 6 }, style]}>
      {header ? (
        <Text variant="caps" tone="tertiary" style={{ paddingHorizontal: 16 }}>
          {header}
        </Text>
      ) : null}
      <View
        style={{
          backgroundColor: p.surfaceCard,
          borderRadius: radius.lg,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: p.separator,
        }}
      >
        {items.map((child, i) => {
          const hasIcon = isValidElement(child) && !!(child as ReactElement<{ icon?: unknown }>).props.icon;
          return (
            <View key={i}>
              {child}
              {i < items.length - 1 ? (
                <View
                  style={{
                    position: "absolute",
                    left: hasIcon ? 60 : 16,
                    right: 0,
                    bottom: 0,
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: p.separator,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      {footer ? (
        <Text variant="footnote" tone="tertiary" style={{ paddingHorizontal: 16 }}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
}
