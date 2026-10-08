import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import CustomButton from "./customButton";
import FormMessage from "./FormMessage";
import TextField from "./TextField";
import { colors, spacing } from "../constants/colors";
import { isSessionExpired } from "../services/api";
import { createProduct, updateProduct } from "../services/productsService";
import { isValidDateString } from "../utils/dates";

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
  const { width } = useWindowDimensions();
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

  const isWide = width >= 560;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><Text style={styles.eyebrow}>{product ? "Editar inventario" : "Nuevo registro"}</Text><Text style={styles.title}>{product ? "Ajusta los datos del producto" : "Agrega un producto"}</Text><Text style={styles.subtitle}>Mantén tus fechas y cantidades listas para consultar.</Text></View>
      <View style={styles.card}>
        <FormMessage message={formError} />
        <TextField label="Nombre" value={form.name} onChangeText={(value) => updateField("name", value)} placeholder="Leche" autoCapitalize="sentences" error={errors.name} />
        <TextField label="Descripción" value={form.description} onChangeText={(value) => updateField("description", value)} placeholder="Leche entera" autoCapitalize="sentences" error={errors.description} />
        <TextField label="Categoría" value={form.category} onChangeText={(value) => updateField("category", value)} placeholder="Lácteos" autoCapitalize="sentences" error={errors.category} />
        <View style={[styles.row, !isWide && styles.rowStacked]}><View style={styles.half}><TextField label="Cantidad" value={form.quantity} onChangeText={(value) => updateField("quantity", value.replace(/[^0-9]/g, ""))} placeholder="0" keyboardType="numeric" error={errors.quantity} /></View><View style={styles.half}><TextField label="Vencimiento" value={form.expirationDate} onChangeText={(value) => updateField("expirationDate", value)} placeholder="AAAA-MM-DD" keyboardType="numbers-and-punctuation" error={errors.expirationDate} /></View></View>
        <View style={styles.actions}><CustomButton title={loading ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"} onPress={handleSubmit} disabled={loading} /><CustomButton title="Cancelar" onPress={onCancel} disabled={loading} variant="secondary" /></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", maxWidth: 760, padding: spacing.page, paddingBottom: 40, width: "100%" },
  header: { marginBottom: 22 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 9, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", lineHeight: 34, marginBottom: 8 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 20, borderWidth: 1, gap: 17, padding: 20 },
  row: { flexDirection: "row", gap: 14 },
  rowStacked: { flexDirection: "column" },
  half: { flex: 1 },
  actions: { gap: 10, marginTop: 5 },
});
