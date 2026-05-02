import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { DBProduct } from "@/lib/products-db";

export function useProducts() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data) setProducts(data as DBProduct[]);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { products, loading };
}
