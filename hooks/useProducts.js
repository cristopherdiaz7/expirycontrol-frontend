import { useEffect, useState } from "react";
import { getProducts } from "../services/productsService";

export default function useProducts(token) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getProducts(token);
      setProducts(data);
    } catch (fetchError) {
      setError(fetchError.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [token]);

  return { products, loading, error, reload: loadProducts };
}