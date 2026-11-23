import { ActivityIndicator, View } from "react-native";
import { useTokens } from "../../theme/use-tokens";

/** Spinner under a list while its next page loads. */
export function ListFooter({ loading }: { loading: boolean }) {
  const p = useTokens();
  if (!loading) return null;
  return (
    <View style={{ paddingVertical: 16, alignItems: "center" }}>
      <ActivityIndicator color={p.accent} />
    </View>
  );
}
