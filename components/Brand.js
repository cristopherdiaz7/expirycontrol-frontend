import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../constants/theme";

export default function Brand({ compact = false }) {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <Feather name="shield" size={17} color={colors.primaryInk} />
      </View>
      {compact ? null : <Text style={styles.name}>ExpiryControl</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: "center", flexDirection: "row", gap: 10 },
  mark: { alignItems: "center", backgroundColor: colors.primary, borderRadius: radius.md, height: 34, justifyContent: "center", width: 34 },
  name: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 16, letterSpacing: -0.1 },
});
