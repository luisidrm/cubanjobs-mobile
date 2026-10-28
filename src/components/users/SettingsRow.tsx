import type { LucideIcon } from "lucide-react-native";
import { ListRow, Toggle } from "../ds";

interface BaseProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconBg?: string;
}

/** Settings rows are ListRows: render them inside a ds <List>. */
export function SettingsToggleRow({
  icon, title, subtitle, value, onChange, disabled, iconBg,
}: BaseProps & { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <ListRow
      icon={icon}
      iconBg={iconBg}
      title={title}
      subtitle={subtitle}
      accessory={<Toggle label={title} value={value} onValueChange={onChange} disabled={disabled} />}
    />
  );
}

export function SettingsLinkRow({
  icon, title, subtitle, onPress, iconBg,
}: BaseProps & { onPress: () => void }) {
  return <ListRow icon={icon} iconBg={iconBg} title={title} subtitle={subtitle} accessory="chevron" onPress={onPress} />;
}
