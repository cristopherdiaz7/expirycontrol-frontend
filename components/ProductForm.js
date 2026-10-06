import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomButton from "./customButton";
import TextField from "./TextField";
import { colors } from "../constants/colors";
import { createProduct, updateProduct } from "../services/productsService";

const emptyProduct = {
  name: "",
  description: "",
  category: "",
  quantity: "",
  expirationDate: "",
};

export default function ProductForm({ token, product, onSaved, onCancel }) {
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(product ? { ...product, quantity: String(product.quantity) } : emptyProduct);
  }, [product]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async () => {
    const trimmedForm = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      quantity: Number(form.quantity),
      expirationDate: form.expirationDate.trim(),
    };

    if (!trimmedForm.name || !trimmedForm.description || !trimmedForm.category || !form.quantity || !trimmedForm.expirationDate) {
      Alert.alert("Faltan datos", "Completa todos los campos del producto.");
      return;
    }

    if (!Number.isInteger(trimmedForm.quantity) || trimmedForm.quantity < 0) {
      Alert.alert("Cantidad inválida", "La cantidad debe ser un número entero igual o mayor que cero.");
      return;
    }

    const parsedDate = new Date(`${trimmedForm.expirationDate}T00:00:00`);
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmedForm.expirationDate)
      && !Number.isNaN(parsedDate.getTime())
      && parsedDate.toISOString().slice(0, 10) === trimmedForm.expirationDate;

    if (!isValidDate) {
      Alert.alert("Fecha inválida", "Usa el formato AAAA-MM-DD.");
      return;
    }

    try {
      setLoading(true);
      const savedProduct = product
        ? await updateProduct(token, product.id, trimmedForm)
        : await createProduct(token, trimmedForm);
      Alert.alert("Operación completada", product ? "Producto actualizado." : "Producto creado.");
      onSaved(savedProduct);
    } catch (error) {
      Alert.alert("No se pudo guardar", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>{product ? "Editar producto" : "Nuevo producto"}</Text>
        <Text style={styles.subtitle}>Completa los datos tal como espera la API.</Text>
      </View>
      <View style={styles.card}>
        <TextField label="Nombre" value={form.name} onChangeText={(value) => updateField("name", value)} placeholder="Leche" autoCapitalize="sentences" />
        <TextField label="Descripción" value={form.description} onChangeText={(value) => updateField("description", value)} placeholder="Leche entera" autoCapitalize="sentences" />
        <TextField label="Categoría" value={form.category} onChangeText={(value) => updateField("category", value)} placeholder="Lácteos" autoCapitalize="sentences" />
        <TextField label="Cantidad" value={form.quantity} onChangeText={(value) => updateField("quantity", value.replace(/[^0-9]/g, ""))} placeholder="0" keyboardType="numeric" />
        <TextField label="Vencimiento" value={form.expirationDate} onChangeText={(value) => updateField("expirationDate", value)} placeholder="AAAA-MM-DD" keyboardType="numbers-and-punctuation" />
        <CustomButton title={loading ? "Guardando..." : product ? "Guardar cambios" : "Crear producto"} onPress={handleSubmit} disabled={loading} />
        <CustomButton title="Cancelar" onPress={onCancel} disabled={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  header: { marginBottom: 16 },
  title: { color: colors.text, fontSize: 26, fontWeight: "800", marginBottom: 6 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 20, borderWidth: 1, gap: 16, padding: 18 },
});
