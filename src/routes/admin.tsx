import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, resolveImageUrl, type DBProduct } from "@/lib/products-db";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — The Peng Collection" }],
  }),
  component: Admin,
});

type Form = {
  id?: string;
  name: string;
  category: string;
  price: string;
  description: string;
  badge: string;
  active: boolean;
  stock: number;
  image_url: string | null;
};

const empty: Form = {
  name: "",
  category: "Abayas",
  price: "Price on request",
  description: "",
  badge: "",
  active: true,
  stock: 1,
  image_url: null,
};

type FilterCat = "All" | (typeof CATEGORIES)[number];
type FilterStatus = "all" | "live" | "hidden" | "out";

function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<DBProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<FilterCat>("All");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/login" });
  }, [user, isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((data ?? []) as DBProduct[]);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const stats = useMemo(() => {
    const totalUnits = items.reduce((n, p) => n + (p.stock ?? 0), 0);
    const live = items.filter((p) => p.active).length;
    const out = items.filter((p) => (p.stock ?? 0) <= 0).length;
    return { total: items.length, live, out, totalUnits };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (filterCat !== "All" && p.category !== filterCat) return false;
      if (filterStatus === "live" && !p.active) return false;
      if (filterStatus === "hidden" && p.active) return false;
      if (filterStatus === "out" && (p.stock ?? 0) > 0) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.description ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, filterCat, filterStatus, search]);

  const reset = () => {
    setForm(empty);
    setEditing(false);
  };

  const startEdit = (p: DBProduct) => {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      description: p.description ?? "",
      badge: p.badge ?? "",
      active: p.active,
      stock: p.stock ?? 0,
      image_url: p.image_url,
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm((f) => ({ ...f, image_url: path }));
    toast.success("Image uploaded");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: form.price || "Price on request",
      description: form.description || null,
      badge: form.badge || null,
      active: form.active,
      stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
      image_url: form.image_url,
    };

    const res = editing && form.id
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);

    setBusy(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Updated" : "Added to collection");
    reset();
    load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Remove this piece from the collection?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  };

  const toggleActive = async (p: DBProduct) => {
    const { error } = await supabase
      .from("products")
      .update({ active: !p.active })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  const adjustStock = async (p: DBProduct, delta: number) => {
    const next = Math.max(0, (p.stock ?? 0) + delta);
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <p className="editorial-eyebrow text-primary">Admin</p>
            <h1 className="font-serif text-2xl">The Peng Collection</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="editorial-eyebrow text-foreground hover:text-primary">View site →</Link>
            <button
              onClick={() => { signOut(); navigate({ to: "/" }); }}
              className="editorial-eyebrow text-foreground hover:text-primary"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="mx-auto max-w-7xl px-5 pt-8 md:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Pieces" value={stats.total} />
          <Stat label="Live" value={stats.live} accent />
          <Stat label="Sold out" value={stats.out} warn={stats.out > 0} />
          <Stat label="Units in stock" value={stats.totalUnits} />
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-12 md:px-8">
        {/* Form */}
        <section className="md:col-span-5">
          <div className="sticky top-24 bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
            <p className="editorial-eyebrow text-primary">
              {editing ? "Edit piece" : "Add piece"}
            </p>
            <h2 className="mt-1 font-serif text-2xl">
              {editing ? form.name || "Untitled" : "New product"}
            </h2>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field label="Name">
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Stock (units)">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: +e.target.value })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Price (free text)">
                <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="₦25,000 or 'Price on request'" className={inputCls} />
              </Field>
              <Field label="Badge (optional)">
                <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="New, Bestseller…" className={inputCls} />
              </Field>
              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} />
              </Field>

              <Field label="Image">
                <div className="flex items-center gap-3">
                  {form.image_url && (
                    <img src={resolveImageUrl(form.image_url)} alt="" className="h-16 w-16 object-cover" />
                  )}
                  <label className="cursor-pointer border border-input bg-background px-4 py-2 editorial-eyebrow text-foreground hover:border-primary">
                    {uploading ? "Uploading…" : form.image_url ? "Replace" : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
                  </label>
                  {form.image_url && (
                    <button type="button" onClick={() => setForm({ ...form, image_url: null })} className="text-xs text-muted-foreground hover:text-destructive">
                      Remove
                    </button>
                  )}
                </div>
              </Field>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Visible on storefront
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={busy} className="flex-1 bg-primary py-3 editorial-eyebrow text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {busy ? "Saving…" : editing ? "Save changes" : "Add piece"}
                </button>
                {editing && (
                  <button type="button" onClick={reset} className="border border-input px-4 editorial-eyebrow text-foreground hover:border-primary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* List */}
        <section className="md:col-span-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pieces…"
                className={`${inputCls} flex-1 min-w-40`}
              />
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value as FilterCat)} className={inputCls + " w-auto"}>
                <option value="All">All categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-1">
              {([
                ["all", "All"],
                ["live", "Live"],
                ["hidden", "Hidden"],
                ["out", "Sold out"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`editorial-eyebrow px-3 py-1.5 text-xs transition-colors ${
                    filterStatus === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70 hover:text-primary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 editorial-eyebrow text-muted-foreground">
            Showing {filtered.length} of {items.length}
          </p>

          <div className="mt-3 space-y-3">
            {filtered.length === 0 && (
              <div className="bg-card p-10 text-center text-sm text-muted-foreground" style={{ boxShadow: "var(--shadow-soft)" }}>
                {items.length === 0 ? "No pieces yet — add your first one →" : "Nothing matches these filters."}
              </div>
            )}
            {filtered.map((p) => {
              const stock = p.stock ?? 0;
              const isOut = stock <= 0;
              return (
                <article key={p.id} className="flex items-center gap-4 bg-card p-3" style={{ boxShadow: "var(--shadow-soft)" }}>
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden bg-muted">
                    {p.image_url && (
                      <img src={resolveImageUrl(p.image_url)} alt={p.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="editorial-eyebrow text-muted-foreground">{p.category}</span>
                      {!p.active && (
                        <span className="editorial-eyebrow rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] text-foreground/70">Hidden</span>
                      )}
                      {isOut && (
                        <span className="editorial-eyebrow rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] text-destructive">Sold out</span>
                      )}
                      {!isOut && stock <= 3 && (
                        <span className="editorial-eyebrow rounded bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">Low · {stock}</span>
                      )}
                    </div>
                    <h3 className="truncate font-serif text-lg">{p.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{p.price}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="editorial-eyebrow text-[10px] text-muted-foreground">Stock</span>
                      <button onClick={() => adjustStock(p, -1)} className="h-6 w-6 border border-input text-xs hover:border-primary" aria-label="Decrease stock">−</button>
                      <span className="min-w-6 text-center text-sm tabular-nums">{stock}</span>
                      <button onClick={() => adjustStock(p, +1)} className="h-6 w-6 border border-input text-xs hover:border-primary" aria-label="Increase stock">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-xs">
                    <button onClick={() => startEdit(p)} className="editorial-eyebrow text-foreground hover:text-primary">Edit</button>
                    <button onClick={() => toggleActive(p)} className="editorial-eyebrow text-muted-foreground hover:text-primary">
                      {p.active ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => onDelete(p.id)} className="editorial-eyebrow text-muted-foreground hover:text-destructive">Delete</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

const inputCls = "border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="editorial-eyebrow text-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return (
    <div
      className={`p-4 ${accent ? "bg-primary text-primary-foreground" : "bg-card"}`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <p className={`editorial-eyebrow ${accent ? "text-primary-foreground/85" : warn ? "text-destructive" : "text-muted-foreground"}`}>
        {label}
      </p>
      <p className="mt-1 font-serif text-3xl tabular-nums">{value}</p>
    </div>
  );
}
