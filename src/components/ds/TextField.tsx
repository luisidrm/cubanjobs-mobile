import type { LucideIcon } from "lucide-react-native";
import { forwardRef, useState, type ComponentRef, type ReactNode } from "react";
import { Platform, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { fontFamily, radius } from "../../theme/tokens";
import { useTokens } from "../../theme/use-tokens";
import { Icon } from "./Icon";
import { Text } from "./Text";

export interface TextFieldProps extends Omit<TextInputProps, "style" | "onChange"> {
  label?: string;
  icon?: LucideIcon;
  trailing?: ReactNode;
  hint?: string;
  error?: string;
  /** Rows for multiline fields. */
  rows?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

/** Labeled input: label above, 48pt tall (multiline grows), accent focus ring. */
export const TextField = forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, icon, trailing, hint, error, multiline, rows = 3, editable = true, containerStyle, onFocus, onBlur, ...rest },
  ref,
) {
  const p = useTokens();
  const [focused, setFocused] = useState(false);
  const border = error ? p.danger : focused ? p.accent : p.border1;
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text variant="footnote" weight="medium" tone="secondary" style={{ paddingLeft: 4 }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          gap: 10,
          minHeight: multiline ? 22 * rows + 24 : 48,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          borderRadius: radius.md,
          backgroundColor: editable ? p.surfaceCard : p.fill1,
          borderWidth: 1,
          borderColor: border,
          // iOS halo approximating the 4px focus ring.
          shadowColor: error ? p.danger : p.accent,
          shadowOpacity: focused ? 0.35 : 0,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        {icon ? <Icon icon={icon} size={18} color={p.text3} /> : null}
        <TextInput
          ref={ref}
          multiline={multiline}
          numberOfLines={multiline ? rows : 1}
          editable={editable}
          placeholderTextColor={p.text3}
          selectionColor={p.accent}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={{
            flex: 1,
            minWidth: 0,
            padding: 0,
            fontFamily: fontFamily.regular,
            fontSize: 16,
            lineHeight: 22,
            color: editable ? p.text1 : p.textDisabled,
            textAlignVertical: multiline ? "top" : "center",
            minHeight: multiline ? 22 * rows : undefined,
            // On the web the browser draws its own black focus outline around the field, inside
            // the accent border. The container's border already shows focus, so remove it.
            ...(Platform.OS === "web" ? ({ outlineStyle: "none", outlineWidth: 0, borderWidth: 0, backgroundColor: "transparent" } as object) : null),
          }}
          {...rest}
        />
        {trailing}
      </View>
      {error || hint ? (
        <Text variant="caption" tone={error ? "danger" : "tertiary"} style={{ paddingLeft: 4 }}>
          {error ?? hint}
        </Text>
      ) : null}
    </View>
  );
});
