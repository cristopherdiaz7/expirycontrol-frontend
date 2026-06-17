const fallbackProducts = [
  { id: "1", name: "Leche", category: "Lácteos", expiry: "Vence en 2 días" },
  { id: "2", name: "Yogur", category: "Lácteos", expiry: "Vencido" },
  { id: "3", name: "Arroz", category: "Abarrotes", expiry: "Vence en 20 días" },
];

export async function getProducts() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  if (!baseUrl) {
    return fallbackProducts;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/products`);

  if (!response.ok) {
    throw new Error("No se pudo obtener la lista de productos");
  }

  return response.json();
}
