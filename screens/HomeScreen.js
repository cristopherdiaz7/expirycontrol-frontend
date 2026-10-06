import { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import StatCard from "../components/StatCard";
import { colors } from "../constants/colors";
import { deleteProduct, getExpiredProducts, getExpiringProducts, getProductStats, getProducts } from "../services/productsService";

const sections = [
  { key: "dashboard", label: "Resumen" },
  { key: "products", label: "Productos" },
  { key: "expired", label: "Vencidos" },
  { key: "expiring", label: "Por vencer" },
];

export default function HomeScreen({ auth, onLogout, onUnauthorized }) {
  const [section, setSection] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productData, expiredData, expiringData, statsData] = await Promise.all([
        getProducts(auth.token),
        getExpiredProducts(auth.token),
        getExpiringProducts(auth.token, days),
        getProductStats(auth.token, days),
      ]);
      setProducts(productData);
      setExpiredProducts(expiredData);
      setExpiringProducts(expiringData);
      setStats(statsData);
    } catch (requestError) {
      if (requestError.status === 401) {
        onUnauthorized();
        return;
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [auth.token, days]);

  const handleDelete = (product) => {
    Alert.alert("Eliminar producto", `¿Quieres eliminar ${product.name}?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try {
          setLoading(true);
          await deleteProduct(auth.token, product.id);
          await loadData();
        } catch (requestError) {
          if (requestError.status === 401) { onUnauthorized(); return; }
          Alert.alert("No se pudo eliminar", requestError.message);
          setLoading(false);
        }
      } },
    ]);
  };

  const handleSaved = async () => {
    setShowForm(false);
    setEditingProduct(null);
    await loadData();
  };

  const visibleProducts = section === "expired" ? expiredProducts : section === "expiring" ? expiringProducts : products;

  if (showForm) {
    return <SafeAreaView style={styles.safeArea}><ProductForm token={auth.token} product={editingProduct} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditingProduct(null); }} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View><Text style={styles.brand}>ExpiryControl</Text><Text style={styles.title}>Hola, {auth.user?.name || "usuario"}</Text></View>
          <Pressable onPress={onLogout} style={styles.logoutButton}><Text style={styles.logoutText}>Salir</Text></Pressable>
        </View>
        <View style={styles.tabs}>{sections.map((item) => <Pressable key={item.key} onPress={() => setSection(item.key)} style={[styles.tab, section === item.key && styles.activeTab]}><Text style={[styles.tabText, section === item.key && styles.activeTabText]}>{item.label}</Text></Pressable>)}</View>
        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={loadData} style={styles.retryButton}><Text style={styles.retryText}>Reintentar</Text></Pressable></View> : null}
        {section === "dashboard" ? <View><Text style={styles.sectionTitle}>Estado de tus productos</Text><View style={styles.statsGrid}><StatCard label="Total" value={stats?.totalProducts ?? "-"} /><StatCard label="Vencidos" value={stats?.expiredProducts ?? "-"} tone="danger" /><StatCard label="Por vencer" value={stats?.expiringSoonProducts ?? "-"} tone="warning" /><StatCard label="Vigentes" value={stats?.validProducts ?? "-"} tone="success" /></View><View style={styles.dashboardActions}><Text style={styles.sectionTitle}>Acciones rápidas</Text><Pressable onPress={() => { setEditingProduct(null); setShowForm(true); }} style={styles.primaryButton}><Text style={styles.primaryText}>+ Agregar producto</Text></Pressable><Text style={styles.helper}>Los datos se actualizan directamente desde tu cuenta del backend.</Text></View></View> : <View><View style={styles.listHeader}><View><Text style={styles.sectionTitle}>{section === "products" ? "Todos tus productos" : section === "expired" ? "Productos vencidos" : "Productos por vencer"}</Text><Text style={styles.helper}>{visibleProducts.length} producto{visibleProducts.length === 1 ? "" : "s"}</Text></View>{section === "products" ? <Pressable onPress={() => { setEditingProduct(null); setShowForm(true); }} style={styles.primaryButtonSmall}><Text style={styles.primaryText}>Agregar</Text></Pressable> : null}</View>{section === "expiring" ? <View style={styles.daysRow}><Text style={styles.helper}>Mostrar próximos a vencer en {days} días</Text><View style={styles.daysButtons}>{[3, 7, 14].map((value) => <Pressable key={value} onPress={() => setDays(value)} style={[styles.dayButton, days === value && styles.selectedDay]}><Text style={[styles.dayText, days === value && styles.selectedDayText]}>{value}d</Text></Pressable>)}</View></View> : null}{loading ? <Text style={styles.loadingText}>Cargando datos...</Text> : null}{!loading && visibleProducts.length === 0 ? <Text style={styles.emptyText}>No hay productos en esta sección.</Text> : null}<FlatList data={visibleProducts} scrollEnabled={false} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.list} renderItem={({ item }) => <ProductCard product={item} onEdit={(product) => { setEditingProduct(product); setShowForm(true); }} onDelete={handleDelete} />} /></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 }, content: { padding: 20, paddingBottom: 36 }, headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 22 }, brand: { color: colors.primary, fontSize: 13, fontWeight: "800", letterSpacing: 1.4, marginBottom: 6, textTransform: "uppercase" }, title: { color: colors.text, fontSize: 28, fontWeight: "800" }, logoutButton: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 }, logoutText: { color: colors.text, fontSize: 13, fontWeight: "700" }, tabs: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }, tab: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 }, activeTab: { backgroundColor: colors.primary, borderColor: colors.primary }, tabText: { color: colors.muted, fontSize: 12, fontWeight: "700" }, activeTabText: { color: colors.white }, sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 12 }, statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, dashboardActions: { marginTop: 28 }, primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 12, padding: 14 }, primaryButtonSmall: { alignSelf: "center", backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }, primaryText: { color: colors.white, fontSize: 13, fontWeight: "800" }, helper: { color: colors.muted, fontSize: 13, lineHeight: 19 }, listHeader: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }, daysRow: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginBottom: 16, padding: 14 }, daysButtons: { flexDirection: "row", gap: 8, marginTop: 10 }, dayButton: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 }, selectedDay: { backgroundColor: colors.primary, borderColor: colors.primary }, dayText: { color: colors.muted, fontSize: 12, fontWeight: "700" }, selectedDayText: { color: colors.white }, list: { gap: 12 }, loadingText: { color: colors.muted, paddingVertical: 16 }, emptyText: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14, borderWidth: 1, color: colors.muted, padding: 18 }, errorBox: { backgroundColor: "#3A2025", borderColor: "#7E3B45", borderRadius: 14, borderWidth: 1, marginBottom: 18, padding: 14 }, errorText: { color: "#FFD9DE", marginBottom: 10 }, retryButton: { alignSelf: "flex-start", borderColor: "#D98691", borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 7 }, retryText: { color: "#FFD9DE", fontWeight: "700" },
});
