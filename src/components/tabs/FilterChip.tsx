import { View } from "react-native";
import { Chip } from "../ds";

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

/** Filter chip (36pt): white hairline when off, accent when on. Spaced for horizontal chip rows. */
export function FilterChip({ label, active, onPress }: Props) {
  return (
    <View style={{ marginRight: 8 }}>
      <Chip variant="filter" label={label} selected={active} onPress={onPress} />
    </View>
  );
}
