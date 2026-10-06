import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

export default function ProductCard({ product, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.meta}>{product.category}</Text>
        </View>
        <Text style={styles.quantity}>x{product.quantity}</Text>
      </View>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.expiry}>Vence: {product.expirationDate}</Text>
      <View style={styles.actions}>
        <Pressable onPress={() => onEdit(product)} style={styles.secondaryButton}>
          <Text style={styles.secondaryText}>Editar</Text>
        </Pressable>
        <Pressable onPress={() => onDelete(product)} style={styles.dangerButton}>
          <Text style={styles.dangerText}>Eliminar</Text>
        </Pressable>
      </View>
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
  heading: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headingText: {
    flex: 1,
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
  description: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 10,
  },
  quantity: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  expiry: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  secondaryButton: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  secondaryText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "#5A242E",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  dangerText: {
    color: "#FFD9DE",
    fontSize: 13,
    fontWeight: "700",
  },
});