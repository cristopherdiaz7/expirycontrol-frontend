import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

export default function ProductCard({ product }) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.meta}>{product.category}</Text>
      <Text style={styles.expiry}>{product.expiry}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 6,
  },
  expiry: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
});