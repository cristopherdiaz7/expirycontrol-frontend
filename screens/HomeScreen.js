import { useEffect, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import StatCard from "../components/StatCard";
import { colors, spacing } from "../constants/colors";
import { deleteProduct, getExpiredProducts, getExpiringProducts, getProductStats, getProducts } from "../services/productsService";

const sections = [
  { key: "dashboard", label: "Resumen" },
  { key: "products", label: "Productos" },
  { key: "expired", label: "Vencidos" },
  { key: "expiring", label: "Por vencer" },
];

export default function HomeScreen({ auth, onLogout, onUnauthorized }) {
  const { width } = useWindowDimensions();
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
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteProduct(auth.token, product.id);
            await loadData();
          } catch (requestError) {
            if (requestError.status === 401) { onUnauthorized(); return; }
            Alert.alert("No se pudo eliminar", requestError.message);
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleSaved = async () => {
    setShowForm(false);
    setEditingProduct(null);
    await loadData();
  };

  const openCreate = () => { setEditingProduct(null); setShowForm(true); };
  const openEdit = (product) => { setEditingProduct(product); setShowForm(true); };
  const visibleProducts = section === "expired" ? expiredProducts : section === "expiring" ? expiringProducts : products;
  const attentionCount = (stats?.expiredProducts || 0) + (stats?.expiringSoonProducts || 0);

  if (showForm) {
    return <SafeAreaView style={styles.safeArea}><ProductForm token={auth.token} product={editingProduct} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditingProduct(null); }} /></SafeAreaView>;
  }

  const isWide = width >= 760;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.shell}>
          <View style={styles.header}>
            <View style={styles.brandRow}><View style={styles.brandMark}><Text style={styles.brandMarkText}>E</Text></View><Text style={styles.brand}>ExpiryControl</Text></View>
            <View style={styles.headerLine}><View style={styles.headerCopy}><Text style={styles.kicker}>Resumen de inventario</Text><Text style={styles.title}>Hola, {auth.user?.name || "usuario"}</Text><Text style={styles.subtitle}>Mira lo que necesita tu atención hoy.</Text></View><Pressable onPress={onLogout} style={styles.logoutButton}><Text style={styles.logoutText}>Cerrar sesión</Text></Pressable></View>
          </View>

          <View style={styles.tabs}>{sections.map((item) => <Pressable key={item.key} onPress={() => setSection(item.key)} style={[styles.tab, section === item.key && styles.activeTab]}><Text style={[styles.tabText, section === item.key && styles.activeTabText]}>{item.label}</Text></Pressable>)}</View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorTitle}>No pudimos actualizar tus datos</Text><Text style={styles.errorText}>{error}</Text><Pressable onPress={loadData} style={styles.retryButton}><Text style={styles.retryText}>Reintentar</Text></Pressable></View> : null}

          {section === "dashboard" ? (
            <View>
              <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Estado de tus productos</Text><Text style={styles.sectionSubtitle}>{loading ? "Actualizando información..." : `${stats?.totalProducts || 0} productos registrados`}</Text></View><Pressable onPress={openCreate} style={styles.primaryButton}><Text style={styles.primaryText}>+ Agregar</Text></Pressable></View>
              <View style={styles.statsGrid}><StatCard label="Total" value={stats?.totalProducts ?? "-"} /><StatCard label="Vencidos" value={stats?.expiredProducts ?? "-"} tone="danger" /><StatCard label="Por vencer" value={stats?.expiringSoonProducts ?? "-"} tone="warning" /><StatCard label="Vigentes" value={stats?.validProducts ?? "-"} tone="success" /></View>
              <View style={[styles.attentionPanel, attentionCount > 0 ? styles.attentionActive : styles.attentionCalm]}><View style={styles.attentionIcon}><Text style={styles.attentionIconText}>{attentionCount > 0 ? "!" : "✓"}</Text></View><View style={styles.attentionCopy}><Text style={styles.attentionTitle}>{attentionCount > 0 ? "Hay productos que revisar" : "Todo está en orden"}</Text><Text style={styles.attentionText}>{attentionCount > 0 ? `${attentionCount} producto${attentionCount === 1 ? " necesita" : "s necesitan"} atención.` : "No tienes productos vencidos o próximos a vencer."}</Text></View></View>
              <View style={styles.quickSection}><Text style={styles.sectionTitle}>Acciones rápidas</Text><View style={[styles.quickGrid, !isWide && styles.quickGridStacked]}><Pressable onPress={() => setSection("products")} style={styles.quickCard}><Text style={styles.quickNumber}>{products.length}</Text><Text style={styles.quickLabel}>Ver productos</Text><Text style={styles.quickHint}>Revisa tu inventario</Text></Pressable><Pressable onPress={() => setSection("expiring")} style={styles.quickCard}><Text style={[styles.quickNumber, { color: colors.warning }]}>{stats?.expiringSoonProducts ?? 0}</Text><Text style={styles.quickLabel}>Por vencer</Text><Text style={styles.quickHint}>Actúa antes de tiempo</Text></Pressable></View></View>
            </View>
          ) : (
            <View>
              <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>{section === "products" ? "Todos tus productos" : section === "expired" ? "Productos vencidos" : "Productos por vencer"}</Text><Text style={styles.sectionSubtitle}>{visibleProducts.length} producto{visibleProducts.length === 1 ? "" : "s"} en esta vista</Text></View>{section === "products" ? <Pressable onPress={openCreate} style={styles.primaryButton}><Text style={styles.primaryText}>+ Agregar</Text></Pressable> : null}</View>
              {section === "expiring" ? <View style={styles.filterBar}><Text style={styles.filterLabel}>Mostrar en los próximos</Text><View style={styles.filterOptions}>{[3, 7, 14].map((value) => <Pressable key={value} onPress={() => setDays(value)} style={[styles.filterOption, days === value && styles.filterOptionActive]}><Text style={[styles.filterText, days === value && styles.filterTextActive]}>{value} días</Text></Pressable>)}</View></View> : null}
              {loading ? <View style={styles.loadingBox}><Text style={styles.loadingText}>Actualizando productos...</Text></View> : null}
              {!loading && visibleProducts.length === 0 ? <View style={styles.emptyBox}><Text style={styles.emptyMark}>{section === "expired" ? "✓" : "＋"}</Text><Text style={styles.emptyTitle}>{section === "expired" ? "Todo en orden" : "Aún no hay productos aquí"}</Text><Text style={styles.emptyText}>{section === "expired" ? "Actualmente no tienes productos vencidos." : section === "products" ? "Agrega tu primer producto para empezar a controlar sus fechas." : "No hay productos dentro del período seleccionado."}</Text>{section === "products" ? <Pressable onPress={openCreate} style={styles.primaryButton}><Text style={styles.primaryText}>Agregar producto</Text></Pressable> : null}</View> : null}
              <View style={styles.productList}>{visibleProducts.map((product) => <ProductCard key={product.id} product={product} onEdit={openEdit} onDelete={handleDelete} />)}</View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { padding: spacing.page, paddingBottom: 48 },
  shell: { alignSelf: "center", maxWidth: 1120, width: "100%" },
  header: { marginBottom: 28 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 38 },
  brandMark: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, height: 32, justifyContent: "center", width: 32 },
  brandMarkText: { color: colors.primaryInk, fontSize: 19, fontWeight: "900" },
  brand: { color: colors.text, fontSize: 16, fontWeight: "800" },
  headerLine: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between" },
  headerCopy: { flex: 1, paddingRight: 16 },
  kicker: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 34, fontWeight: "800", lineHeight: 40 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8 },
  logoutButton: { borderColor: colors.border, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  logoutText: { color: colors.softText, fontSize: 12, fontWeight: "700" },
  tabs: { borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: "row", gap: 22, marginBottom: 30 },
  tab: { borderBottomColor: "transparent", borderBottomWidth: 2, paddingBottom: 12, paddingHorizontal: 2 },
  activeTab: { borderBottomColor: colors.primary },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  activeTabText: { color: colors.primary },
  sectionHeader: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800", marginBottom: 5 },
  sectionSubtitle: { color: colors.muted, fontSize: 13 },
  primaryButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11 },
  primaryText: { color: colors.primaryInk, fontSize: 12, fontWeight: "800" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  attentionPanel: { alignItems: "center", borderRadius: 16, flexDirection: "row", gap: 13, marginTop: 18, padding: 16 },
  attentionIcon: { alignItems: "center", borderRadius: 10, height: 34, justifyContent: "center", width: 34 },
  attentionActive: { backgroundColor: colors.warningSoft, borderColor: "#806632", borderWidth: 1 },
  attentionCalm: { backgroundColor: colors.successSoft, borderColor: "#397556", borderWidth: 1 },
  attentionIcon: { alignItems: "center", backgroundColor: colors.warning, borderRadius: 10, height: 34, justifyContent: "center", width: 34 },
  attentionIconText: { color: colors.primaryInk, fontSize: 18, fontWeight: "900" },
  attentionCopy: { flex: 1 },
  attentionTitle: { color: colors.text, fontSize: 14, fontWeight: "800", marginBottom: 3 },
  attentionText: { color: colors.softText, fontSize: 13 },
  quickSection: { marginTop: 32 },
  quickGrid: { flexDirection: "row", gap: 12 },
  quickGridStacked: { flexDirection: "column" },
  quickCard: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flex: 1, padding: 17 },
  quickNumber: { color: colors.primary, fontSize: 26, fontWeight: "800", marginBottom: 9 },
  quickLabel: { color: colors.text, fontSize: 14, fontWeight: "800", marginBottom: 4 },
  quickHint: { color: colors.muted, fontSize: 12 },
  filterBar: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 14, borderWidth: 1, marginBottom: 18, padding: 14 },
  filterLabel: { color: colors.muted, fontSize: 12, fontWeight: "700", marginBottom: 10 },
  filterOptions: { flexDirection: "row", gap: 8 },
  filterOption: { borderColor: colors.border, borderRadius: 8, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  filterOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: colors.primaryInk },
  loadingBox: { backgroundColor: colors.card, borderRadius: 14, padding: 18 },
  loadingText: { color: colors.muted, fontSize: 13 },
  productList: { gap: 12 },
  emptyBox: { alignItems: "center", backgroundColor: colors.card, borderColor: colors.border, borderRadius: 18, borderWidth: 1, marginBottom: 12, padding: 28 },
  emptyMark: { color: colors.primary, fontSize: 28, fontWeight: "800", marginBottom: 10 },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 6 },
  emptyText: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 16, maxWidth: 340, textAlign: "center" },
  errorBox: { backgroundColor: colors.dangerSoft, borderColor: "#80434A", borderRadius: 14, borderWidth: 1, marginBottom: 18, padding: 16 },
  errorTitle: { color: colors.text, fontSize: 14, fontWeight: "800", marginBottom: 5 },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 12 },
  retryButton: { alignSelf: "flex-start", borderColor: colors.danger, borderRadius: 8, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  retryText: { color: colors.danger, fontSize: 12, fontWeight: "800" },
});
