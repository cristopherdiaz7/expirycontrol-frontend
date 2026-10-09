import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import AppBackground from "../components/AppBackground";
import Brand from "../components/Brand";
import CustomButton from "../components/customButton";
import { useFeedback } from "../components/FeedbackProvider";
import NavBar from "../components/NavBar";
import LossCenter from "../components/LossCenter";
import NotificationCenter from "../components/NotificationCenter";
import ProductCard from "../components/ProductCard";
import ProductForm from "../components/ProductForm";
import StatCard from "../components/StatCard";
import StateBox from "../components/StateBox";
import { colors, fonts, glass, layout, radius, spacing, tones, type } from "../constants/theme";
import { isSessionExpired } from "../services/api";
import { getLossStats, getLosses } from "../services/lossesService";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notificationsService";
import { deleteProduct, getExpiredProducts, getExpiringProducts, getProductStats, getProducts } from "../services/productsService";
import useBreakpoint from "../utils/useBreakpoint";

const sections = [
  { key: "dashboard", label: "Resumen", icon: "grid" },
  { key: "products", label: "Productos", icon: "package" },
  { key: "expired", label: "Vencidos", icon: "alert-octagon" },
  { key: "expiring", label: "Por vencer", icon: "clock" },
  { key: "notifications", label: "Notificaciones", shortLabel: "Avisos", icon: "bell" },
  { key: "losses", label: "Pérdidas", icon: "trending-down" },
];

const sectionCopy = {
  dashboard: { kicker: "Resumen de inventario", subtitle: "Mira lo que necesita tu atención hoy." },
  products: { kicker: "Inventario", title: "Todos tus productos", subtitle: "Revisa, edita o elimina lo que tienes registrado." },
  expired: { kicker: "Requieren atención", title: "Productos vencidos", subtitle: "Productos cuya fecha de vencimiento ya llegó." },
  expiring: { kicker: "Próximos vencimientos", title: "Productos por vencer", subtitle: "Actúa antes de que lleguen a su fecha." },
  notifications: { kicker: "Centro de notificaciones", title: "Notificaciones", subtitle: "Alertas de productos vencidos y de próximos vencimientos." },
  losses: { kicker: "Pérdidas económicas", title: "Pérdidas", subtitle: "Importe perdido por productos vencidos, en pesos argentinos (ARS)." },
};

const emptyCopy = {
  products: { icon: "inbox", title: "Aún no hay productos", text: "Agrega tu primer producto para empezar a controlar sus fechas." },
  expired: { icon: "check-circle", title: "Todo en orden", text: "Actualmente no tienes productos vencidos." },
  expiring: { icon: "calendar", title: "Nada por vencer", text: "No hay productos dentro del período seleccionado." },
};

const GRID_GAP = 14;

export default function HomeScreen({ auth, onLogout, onUnauthorized }) {
  const { width, isTablet, isDesktop, isWide } = useBreakpoint();
  const { notify, confirm } = useFeedback();
  const [section, setSection] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [expiredProducts, setExpiredProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState(null);
  const [markingRead, setMarkingRead] = useState(false);
  const [losses, setLosses] = useState(null);
  const [lossStats, setLossStats] = useState(null);
  const [lossesLoading, setLossesLoading] = useState(true);
  const [lossesError, setLossesError] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  // Ancho real del contenido, para calcular las columnas de las grillas.
  const [shellWidth, setShellWidth] = useState(Math.min(width - spacing.page * 2, layout.maxWidth));

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
      if (isSessionExpired(requestError)) {
        onUnauthorized();
        return;
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  // Las notificaciones se cargan aparte: si fallan, el resto de la app sigue funcionando.
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError(null);
      setNotifications(await getNotifications(auth.token));
    } catch (requestError) {
      if (isSessionExpired(requestError)) {
        onUnauthorized();
        return;
      }
      setNotificationsError(requestError.status === 404 ? "El servidor no ofrece notificaciones. Verifica que el backend esté actualizado." : requestError.message);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Igual que las notificaciones: se cargan aparte para no bloquear el resto.
  const loadLosses = async () => {
    try {
      setLossesLoading(true);
      setLossesError(null);
      const [lossData, lossStatsData] = await Promise.all([getLosses(auth.token), getLossStats(auth.token)]);
      setLosses(lossData);
      setLossStats(lossStatsData);
    } catch (requestError) {
      if (isSessionExpired(requestError)) {
        onUnauthorized();
        return;
      }
      setLossesError(requestError.status === 404 ? "El servidor no ofrece el registro de pérdidas. Verifica que el backend esté actualizado." : requestError.message);
    } finally {
      setLossesLoading(false);
    }
  };

  const reloadAll = () => Promise.all([loadData(), loadNotifications(), loadLosses()]);

  useEffect(() => { loadData(); }, [auth.token, days]);
  // No dependen del filtro de días: se recargan al cambiar la sesión o los productos.
  useEffect(() => { loadNotifications(); loadLosses(); }, [auth.token]);

  const handleDelete = async (product) => {
    const accepted = await confirm({
      title: "Eliminar producto",
      message: `¿Quieres eliminar ${product.name}? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      destructive: true,
    });
    if (!accepted) return;

    try {
      setLoading(true);
      await deleteProduct(auth.token, product.id);
      notify(`${product.name} fue eliminado.`, { title: "Producto eliminado" });
      await reloadAll();
    } catch (requestError) {
      if (isSessionExpired(requestError)) { onUnauthorized(); return; }
      setLoading(false);
      if (requestError.status === 404) {
        // Otro dispositivo ya lo eliminó: se refresca la lista.
        await reloadAll();
      }
      notify(requestError.message, { title: "No se pudo eliminar", tone: "danger" });
    }
  };

  // Las dos acciones devuelven la lista ya actualizada.
  const updateReadState = async (request) => {
    try {
      setMarkingRead(true);
      setNotifications(await request());
    } catch (requestError) {
      if (isSessionExpired(requestError)) { onUnauthorized(); return; }
      if (requestError.status === 404) {
        // El producto cambió o se eliminó desde otro dispositivo: se refresca todo.
        await reloadAll();
        return;
      }
      notify(requestError.message, { title: "No se pudo actualizar", tone: "danger" });
    } finally {
      setMarkingRead(false);
    }
  };

  const handleMarkRead = (notification) => updateReadState(() => markNotificationRead(auth.token, notification.productId));
  const handleMarkAllRead = () => updateReadState(() => markAllNotificationsRead(auth.token));

  const handleSaved = async (_savedProduct, message) => {
    setShowForm(false);
    setEditingProduct(null);
    if (message) notify(message, { title: "Operación completada" });
    await reloadAll();
  };

  const closeForm = () => { setShowForm(false); setEditingProduct(null); };
  const openCreate = () => { setEditingProduct(null); setShowForm(true); };
  const openEdit = (product) => { setEditingProduct(product); setShowForm(true); };

  if (showForm) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBackground />
        <ProductForm token={auth.token} product={editingProduct} onSaved={handleSaved} onUnauthorized={onUnauthorized} onCancel={closeForm} />
      </SafeAreaView>
    );
  }

  const visibleProducts = section === "expired" ? expiredProducts : section === "expiring" ? expiringProducts : products;
  const attentionCount = (stats?.expiredProducts || 0) + (stats?.expiringSoonProducts || 0);
  const needsAttention = attentionCount > 0;
  const attentionTone = needsAttention ? tones.warning : tones.success;
  const copy = sectionCopy[section];

  const unreadCount = notifications?.unreadCount || 0;
  const navItems = sections.map((item) => (item.key === "notifications" && unreadCount > 0 ? { ...item, badge: unreadCount > 99 ? "99+" : unreadCount } : item));

  const productColumns = isWide ? 3 : isTablet ? 2 : 1;
  const productWidth = Math.floor((shellWidth - GRID_GAP * (productColumns - 1)) / productColumns);
  const statColumns = isDesktop ? 4 : 2;
  const statWidth = Math.floor((shellWidth - GRID_GAP * (statColumns - 1)) / statColumns);
  const lossStatColumns = isTablet ? 3 : 1;
  const lossStatWidth = Math.floor((shellWidth - GRID_GAP * (lossStatColumns - 1)) / lossStatColumns);
  const productsWithoutPrice = products.filter((product) => product.unitPrice === null || product.unitPrice === undefined).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AppBackground />
      {isDesktop ? <NavBar variant="top" items={navItems} current={section} onChange={setSection} onLogout={onLogout} compact={!isWide} /> : null}

      <ScrollView contentContainerStyle={[styles.content, isDesktop ? styles.contentDesktop : styles.contentMobile]}>
        <View style={styles.shell} onLayout={(event) => setShellWidth(event.nativeEvent.layout.width)}>
          {!isDesktop ? (
            <View style={styles.mobileTop}>
              <Brand />
              <Pressable onPress={onLogout} accessibilityRole="button" accessibilityLabel="Cerrar sesión" style={styles.iconButton}>
                <Feather name="log-out" size={17} color={colors.softText} />
              </Pressable>
            </View>
          ) : null}

          <View style={[styles.header, isTablet && styles.headerWide]}>
            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>{copy.kicker}</Text>
              <Text style={[styles.title, !isTablet && styles.titleCompact]}>{section === "dashboard" ? `Hola, ${auth.user?.name || "usuario"}` : copy.title}</Text>
              <Text style={styles.subtitle}>{copy.subtitle}</Text>
            </View>
            {section === "dashboard" || section === "products" ? <CustomButton title="Agregar producto" icon="plus" onPress={openCreate} style={!isTablet && styles.fullWidth} /> : null}
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <View style={styles.errorIcon}><Feather name="wifi-off" size={18} color={colors.danger} /></View>
              <View style={styles.errorCopy}>
                <Text style={styles.errorTitle}>No pudimos actualizar tus datos</Text>
                <Text style={styles.errorText}>{error}</Text>
              </View>
              <CustomButton title="Reintentar" icon="refresh-cw" size="sm" variant="danger" onPress={reloadAll} />
            </View>
          ) : null}

          {section === "dashboard" ? (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Estado de tus productos</Text>
                <Text style={styles.sectionSubtitle}>{loading ? "Actualizando información..." : `${stats?.totalProducts || 0} productos registrados`}</Text>
              </View>

              <View style={styles.grid}>
                <StatCard label="Total" icon="box" value={stats?.totalProducts ?? "-"} style={{ width: statWidth }} />
                <StatCard label="Vencidos" icon="alert-octagon" tone="danger" value={stats?.expiredProducts ?? "-"} style={{ width: statWidth }} />
                <StatCard label="Por vencer" icon="clock" tone="warning" value={stats?.expiringSoonProducts ?? "-"} style={{ width: statWidth }} />
                <StatCard label="Vigentes" icon="check-circle" tone="success" value={stats?.validProducts ?? "-"} style={{ width: statWidth }} />
              </View>

              {stats ? (
                <View style={[styles.attentionPanel, { backgroundColor: attentionTone.bg, borderColor: attentionTone.border }]}>
                  <View style={[styles.attentionIcon, { backgroundColor: attentionTone.fg }]}>
                    <Feather name={needsAttention ? "alert-triangle" : "check"} size={18} color={colors.primaryInk} />
                  </View>
                  <View style={styles.attentionCopy}>
                    <Text style={styles.attentionTitle}>{needsAttention ? "Hay productos que revisar" : "Todo está en orden"}</Text>
                    <Text style={styles.attentionText}>{needsAttention ? `${attentionCount} producto${attentionCount === 1 ? " necesita" : "s necesitan"} atención.` : "No tienes productos vencidos o próximos a vencer."}</Text>
                  </View>
                </View>
              ) : null}

              <View style={styles.quickSection}>
                <Text style={styles.sectionTitle}>Acciones rápidas</Text>
                <View style={[styles.quickGrid, !isTablet && styles.quickGridStacked]}>
                  <QuickCard icon="package" tone="default" value={products.length} label="Ver productos" hint="Revisa tu inventario" onPress={() => setSection("products")} />
                  <QuickCard icon="alert-octagon" tone="danger" value={stats?.expiredProducts ?? 0} label="Vencidos" hint="Retira lo que ya venció" onPress={() => setSection("expired")} />
                  <QuickCard icon="clock" tone="warning" value={stats?.expiringSoonProducts ?? 0} label="Por vencer" hint="Actúa antes de tiempo" onPress={() => setSection("expiring")} />
                </View>
              </View>
            </View>
          ) : section === "losses" ? (
            <LossCenter losses={losses} stats={lossStats} loading={lossesLoading} error={lossesError} onRetry={loadLosses} productsWithoutPrice={productsWithoutPrice} statWidth={lossStatWidth} compact={!isTablet} />
          ) : section === "notifications" ? (
            <NotificationCenter data={notifications} loading={notificationsLoading} error={notificationsError} busy={markingRead} onMarkRead={handleMarkRead} onMarkAllRead={handleMarkAllRead} onRetry={loadNotifications} />
          ) : (
            <View>
              {section === "expiring" ? (
                <View style={styles.filterBar}>
                  <View style={styles.filterLabelRow}>
                    <Feather name="sliders" size={14} color={colors.muted} />
                    <Text style={styles.filterLabel}>Mostrar en los próximos</Text>
                  </View>
                  <View style={styles.filterOptions}>
                    {[3, 7, 14].map((value) => (
                      <Pressable key={value} onPress={() => setDays(value)} accessibilityRole="button" accessibilityState={{ selected: days === value }} style={[styles.filterOption, days === value && styles.filterOptionActive]}>
                        <Text style={[styles.filterText, days === value && styles.filterTextActive]}>{value} días</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Text style={styles.count}>{loading ? "Actualizando productos..." : `${visibleProducts.length} producto${visibleProducts.length === 1 ? "" : "s"} en esta vista`}</Text>

              {loading && visibleProducts.length === 0 ? (
                <StateBox loading text="Cargando productos..." style={styles.stateBox} />
              ) : null}

              {!loading && !error && visibleProducts.length === 0 ? (
                <StateBox
                  icon={emptyCopy[section].icon}
                  title={emptyCopy[section].title}
                  text={emptyCopy[section].text}
                  action={section === "products" ? <CustomButton title="Agregar producto" icon="plus" onPress={openCreate} /> : null}
                  style={styles.stateBox}
                />
              ) : null}

              <View style={styles.grid}>
                {visibleProducts.map((product) => <ProductCard key={product.id} product={product} soonDays={days} onEdit={openEdit} onDelete={handleDelete} style={{ width: productWidth }} />)}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {!isDesktop ? <NavBar variant="bottom" items={navItems} current={section} onChange={setSection} onLogout={onLogout} /> : null}
    </SafeAreaView>
  );
}

function QuickCard({ icon, tone, value, label, hint, onPress }) {
  const palette = tones[tone];

  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ hovered, pressed }) => [styles.quickCard, hovered && styles.quickCardHovered, pressed && styles.quickCardPressed]}>
      <View style={[styles.quickIcon, { backgroundColor: palette.bg }]}>
        <Feather name={icon} size={18} color={palette.fg} />
      </View>
      <View style={styles.quickCopy}>
        <Text style={styles.quickLabel}>{label}</Text>
        <Text style={styles.quickHint}>{hint}</Text>
      </View>
      <Text style={[styles.quickNumber, { color: palette.fg }]}>{value}</Text>
      <Feather name="chevron-right" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { paddingHorizontal: spacing.page },
  contentMobile: { paddingBottom: 124, paddingTop: 20 },
  contentDesktop: { paddingBottom: 56, paddingTop: 16 + layout.navHeight + 36 },
  shell: { alignSelf: "center", maxWidth: layout.maxWidth, width: "100%" },

  mobileTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  iconButton: { ...glass.surface, alignItems: "center", borderRadius: radius.md, height: 40, justifyContent: "center", width: 40 },

  header: { gap: 18, marginBottom: 28 },
  headerWide: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between" },
  headerCopy: { flexShrink: 1 },
  kicker: { ...type.kicker, marginBottom: 10 },
  title: { ...type.display, fontSize: 34, lineHeight: 40 },
  titleCompact: { fontSize: 27, lineHeight: 33 },
  subtitle: { ...type.body, fontSize: 15, marginTop: 8 },
  fullWidth: { alignSelf: "stretch" },

  errorBox: { alignItems: "center", backgroundColor: colors.dangerSoft, borderColor: colors.dangerBorder, borderRadius: radius.lg, borderWidth: 1, flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 22, padding: 16 },
  errorIcon: { alignItems: "center", backgroundColor: colors.dangerSoft, borderRadius: radius.md, height: 38, justifyContent: "center", width: 38 },
  errorCopy: { flex: 1, minWidth: 180 },
  errorTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, marginBottom: 3 },
  errorText: { color: colors.danger, fontFamily: fonts.medium, fontSize: 13, lineHeight: 19 },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { ...type.heading },
  sectionSubtitle: { ...type.small, fontSize: 13, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },

  attentionPanel: { alignItems: "center", borderRadius: radius.lg, borderWidth: 1, flexDirection: "row", gap: 14, marginTop: GRID_GAP, padding: 16 },
  attentionIcon: { alignItems: "center", borderRadius: radius.md, height: 38, justifyContent: "center", width: 38 },
  attentionCopy: { flex: 1 },
  attentionTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 14.5, marginBottom: 3 },
  attentionText: { ...type.body, fontSize: 13.5 },

  quickSection: { gap: 16, marginTop: spacing.section },
  quickGrid: { flexDirection: "row", gap: GRID_GAP },
  quickGridStacked: { flexDirection: "column" },
  quickCard: { ...glass.surface, alignItems: "center", borderRadius: radius.lg, flex: 1, flexDirection: "row", gap: 12, padding: 16 },
  quickCardHovered: { borderColor: colors.borderStrong },
  quickCardPressed: { opacity: 0.85 },
  quickIcon: { alignItems: "center", borderRadius: radius.md, height: 40, justifyContent: "center", width: 40 },
  quickCopy: { flex: 1, minWidth: 0 },
  quickLabel: { color: colors.text, fontFamily: fonts.bold, fontSize: 14.5 },
  quickHint: { ...type.small, marginTop: 2 },
  quickNumber: { fontFamily: fonts.extrabold, fontSize: 22, letterSpacing: -0.4 },

  filterBar: { ...glass.surface, alignItems: "center", borderRadius: radius.lg, flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between", marginBottom: 18, paddingHorizontal: 16, paddingVertical: 12 },
  filterLabelRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  filterLabel: { color: colors.softText, fontFamily: fonts.medium, fontSize: 13 },
  filterOptions: { backgroundColor: "rgba(0, 0, 0, 0.22)", borderRadius: radius.pill, flexDirection: "row", gap: 4, padding: 4 },
  filterOption: { borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  filterOptionActive: { backgroundColor: colors.primary },
  filterText: { color: colors.softText, fontFamily: fonts.semibold, fontSize: 12.5 },
  filterTextActive: { color: colors.primaryInk, fontFamily: fonts.bold },

  count: { ...type.small, fontSize: 13, marginBottom: 14 },
  stateBox: { marginBottom: GRID_GAP },
});
