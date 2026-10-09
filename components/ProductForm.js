import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomButton from "./customButton";
import FormMessage from "./FormMessage";
import TextField from "./TextField";
import { colors, fonts, glass, radius, shadows, spacing, type } from "../constants/theme";
import { isSessionExpired } from "../services/api";
import { createProduct, updateProduct } from "../services/productsService";
import { isValidDateString } from "../utils/dates";
import useBreakpoint from "../utils/useBreakpoint";

const emptyProduct = { name: "", description: "", category: "", quantity: "", expirationDate: "" };

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Ingresa el nombre del producto.";
  if (!form.description.trim()) errors.description = "Ingresa una descripción.";
  if (!form.category.trim()) errors.category = "Ingresa una categoría.";

  if (form.quantity === "") {
    errors.quantity = "Ingresa la cantidad.";
  } else if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0) {
    errors.quantity = "Debe ser un número entero igual o mayor que cero.";
  }

  if (!form.expirationDate.trim()) {
    errors.expirationDate = "Ingresa la fecha de vencimiento.";
  } else if (!isValidDateString(form.expirationDate.trim())) {
    errors.expirationDate = "Usa una fecha válida con formato AAAA-MM-DD.";
  }

  return errors;
}

export default function ProductForm({ token, product, onSaved, onCancel, onUnauthorized }) {
  const { isTablet } = useBreakpoint();
  const [form, setForm] = useState(emptyProduct);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(product ? { ...product, quantity: String(product.quantity) } : emptyProduct);
    setErrors({});
    setFormError(null);
  }, [product]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    const payload = { name: form.name.trim(), description: form.description.trim(), category: form.category.trim(), quantity: Number(form.quantity), expirationDate: form.expirationDate.trim() };

    try {
      setLoading(true);
      const savedProduct = product ? await updateProduct(token, product.id, payload) : await createProduct(token, payload);
      onSaved(savedProduct, product ? "Producto actualizado." : "Producto creado.");
    } catch (error) {
      if (isSessionExpired(error)) {
        onUnauthorized();
        return;
      }
      setFormError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Pressable onPress={onCancel} disabled={loading} accessibilityRole="button" style={styles.back}>
        <Feather name="arrow-left" size={16} color={colors.softText} />
        <Text style={styles.backText}>Volver</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.kicker}>{product ? "Editar inventario" : "Nuevo registro"}</Text>
        <Text style={styles.title}>{product ? "Ajusta los datos del producto" : "Agrega un producto"}</Text>
        <Text style={styles.subtitle}>Mantén tus fechas y cantidades listas para consultar.</Text>
      </View>

      <View style={styles.card}>
        <FormMessage message={formError} />
        <TextField label="Nombre" icon="package" value={form.name} onChangeText={(value) => updateField("name", value)} placeholder="Leche" autoCapitalize="sentences" error={errors.name} />
        <TextField label="Descripción" icon="file-text" value={form.description} onChangeText={(value) => updateField("description", value)} placeholder="Leche entera" autoCapitalize="sentences" error={errors.description} />
        <TextField label="Categoría" icon="tag" value={form.category} onChangeText={(value) => updateField("category", value)} placeholder="Lácteos" autoCapitalize="sentences" error={errors.category} />
        <View style={[styles.row, !isTablet && styles.rowStacked]}>
          <View style={styles.half}><TextField label="Cantidad" icon="layers" value={form.quantity} onChangeText={(value) => updateField("quantity", value.replace(/[^0-9]/g, ""))} placeholder="0" keyboardType="numeric" error={errors.quantity} /></View>
          <View style={styles.half}><TextField label="Vencimiento" icon="calendar" value={form.expirationDate} onChangeText={(value) => updateField("expirationDate", value)} placeholder="AAAA-MM-DD" keyboardType="numbers-and-punctuation" error={errors.expirationDate} helper="Ejemplo: 2026-12-31" /></View>
        </View>
        <View style={[styles.actions, isTablet && styles.actionsWide]}>
          <CustomButton title="Cancelar" onPress={onCancel} disabled={loading} variant="secondary" style={isTablet && styles.actionWide} />
          <CustomButton title={loading ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"} icon={loading ? undefined : "check"} onPress={handleSubmit} disabled={loading} style={isTablet && styles.actionWide} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 720, padding: spacing.page, paddingBottom: 48, paddingTop: 28, width: "100%" },
  back: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", gap: 8, marginBottom: 22, paddingVertical: 6 },
  backText: { color: colors.softText, fontFamily: fonts.semibold, fontSize: 13.5 },
  header: { marginBottom: 22 },
  kicker: { ...type.kicker, marginBottom: 10 },
  title: { ...type.title, marginBottom: 8 },
  subtitle: { ...type.body },
  card: { ...glass.surface, ...shadows.card, borderRadius: radius.xl, gap: 17, padding: 22 },
  row: { flexDirection: "row", gap: 14 },
  rowStacked: { flexDirection: "column", gap: 17 },
  half: { flex: 1 },
  actions: { flexDirection: "column-reverse", gap: 10, marginTop: 6 },
  actionsWide: { flexDirection: "row", justifyContent: "flex-end" },
  actionWide: { minWidth: 170 },
});
