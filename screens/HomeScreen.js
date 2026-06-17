import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import ProductCard from "../components/ProductCard";
import { colors } from "../constants/colors";
import useProducts from "../hooks/useProducts";

export default function HomeScreen({ onLogout }) {
	const { products, loading, error, reload } = useProducts();

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<View style={styles.headerRow}>
					<Text style={styles.brand}>ExpiryControl</Text>
					<Pressable onPress={onLogout} style={styles.logoutButton}>
						<Text style={styles.logoutButtonText}>Salir</Text>
					</Pressable>
				</View>
				<Text style={styles.title}>Productos próximos a vencer</Text>
				<Text style={styles.subtitle}>
					Esta pantalla consume datos con GET y puede usar un backend real cuando agregues la URL.
				</Text>
			</View>

			{loading ? (
				<View style={styles.stateBox}>
					<Text style={styles.stateText}>Cargando productos...</Text>
				</View>
			) : null}

			{error ? (
				<View style={styles.stateBox}>
					<Text style={styles.stateText}>Error: {error}</Text>
					<Pressable onPress={reload} style={styles.retryButton}>
						<Text style={styles.retryButtonText}>Reintentar</Text>
					</Pressable>
				</View>
			) : null}

			<FlatList
				data={products}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.list}
				ListEmptyComponent={!loading && !error ? <Text style={styles.emptyText}>No hay productos para mostrar.</Text> : null}
				renderItem={({ item }) => <ProductCard product={item} />}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		backgroundColor: colors.background,
		flex: 1,
		padding: 20,
	},
	header: {
		marginBottom: 20,
	},
	headerRow: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	brand: {
		color: colors.primary,
		fontSize: 13,
		fontWeight: "800",
		letterSpacing: 1.4,
		marginBottom: 8,
		textTransform: "uppercase",
	},
	title: {
		color: colors.text,
		fontSize: 26,
		fontWeight: "800",
		marginBottom: 8,
	},
	subtitle: {
		color: colors.muted,
		fontSize: 14,
		lineHeight: 20,
	},
	stateBox: {
		backgroundColor: colors.cardElevated,
		borderColor: colors.border,
		borderRadius: 16,
		borderWidth: 1,
		gap: 12,
		marginBottom: 16,
		padding: 16,
	},
	stateText: {
		color: colors.text,
		fontSize: 14,
	},
	retryButton: {
		alignSelf: "flex-start",
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	retryButtonText: {
		color: colors.white,
		fontWeight: "700",
	},
	logoutButton: {
		backgroundColor: colors.cardElevated,
		borderColor: colors.border,
		borderRadius: 12,
		borderWidth: 1,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	logoutButtonText: {
		color: colors.text,
		fontSize: 12,
		fontWeight: "700",
	},
	list: {
		gap: 12,
		paddingBottom: 12,
	},
	emptyText: {
		color: colors.muted,
		fontSize: 14,
		paddingVertical: 16,
	},
});
