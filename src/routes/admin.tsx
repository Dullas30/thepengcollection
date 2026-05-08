import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, resolveImageUrl, type DBProduct } from "@/lib/products-db";
import { toast } from "sonner";
import {
  Package, Boxes,
  Search, Plus, Minus, Pencil, Trash2, Upload, X, ImageIcon,
  LogOut, ExternalLink, Filter,
} from "lucide-react";

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
type FilterStatus = "all" | "in" | "out";

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
  const [showForm, setShowForm] = useState(false);

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
    const inStock = items.filter((p) => (p.stock ?? 0) > 0).length;
    const out = items.filter((p) => (p.stock ?? 0) <= 0).length;
    return { total: items.length, inStock, out, totalUnits };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (filterCat !== "All" && p.category !== filterCat) return false;
      if (filterStatus === "in" && (p.stock ?? 0) <= 0) return false;
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
    setShowForm(false);
  };

  const startNew = () => {
    setForm(empty);
    setEditing(false);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setShowForm(true);
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

  const adjustStock = async (p: DBProduct, delta: number) => {
    const next = Math.max(0, (p.stock ?? 0) + delta);
    const { error } = await supabase.from("products").update({ stock: next }).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  const toggleActive = async (p: DBProduct) => {
    const { error } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
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
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 via-background to-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-primary text-primary-foreground">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="editorial-eyebrow text-primary">Atelier · Admin</p>
              <h1 className="font-serif text-xl leading-tight md:text-2xl">The Peng Collection</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              to="/"
              className="hidden items-center gap-1.5 editorial-eyebrow text-foreground hover:text-primary sm:inline-flex"
            >
              View site <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={() => { signOut(); navigate({ to: "/" }); }}
              className="inline-flex items-center gap-1.5 editorial-eyebrow text-foreground hover:text-primary"
            >
              <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border border-border bg-card p-3 md:flex-row md:items-center md:p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description…"
              className="w-full border border-input bg-background py-2.5 pl-10 pr-9 text-sm focus:border-primary focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary" aria-label="Clear">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value as FilterCat)}
              className="border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={startNew}
            className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-2.5 editorial-eyebrow text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> New piece
          </button>
        </div>

        {/* Status pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {([
            ["all", `All · ${stats.total}`],
            ["in", `In stock · ${stats.inStock}`],
            ["out", `Sold out · ${stats.out}`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key as FilterStatus)}
              className={`editorial-eyebrow border px-3 py-1.5 text-xs transition-colors ${
                filterStatus === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/70 hover:border-primary hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Form / drawer */}
          {showForm && (
            <section className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              <div className="border border-border bg-card" style={{ boxShadow: "var(--shadow-soft)" }}>
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <p className="editorial-eyebrow text-primary">{editing ? "Edit piece" : "Add piece"}</p>
                    <h2 className="mt-0.5 font-serif text-xl">{editing ? form.name || "Untitled" : "New product"}</h2>
                  </div>
                  <button onClick={reset} aria-label="Close" className="p-1.5 text-muted-foreground hover:text-primary">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 p-5">
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
                        type="number" min={0} step={1}
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
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                        {form.image_url ? (
                          <img src={resolveImageUrl(form.image_url)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 border border-input bg-background px-3 py-2 editorial-eyebrow text-foreground hover:border-primary">
                          <Upload className="h-3.5 w-3.5" />
                          {uploading ? "Uploading…" : form.image_url ? "Replace" : "Upload"}
                          <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
                        </label>
                        {form.image_url && (
                          <button type="button" onClick={() => setForm({ ...form, image_url: null })} className="text-left text-xs text-muted-foreground hover:text-destructive">
                            Remove image
                          </button>
                        )}
                      </div>
                    </div>
                  </Field>

                  <label className="flex items-center gap-2 pt-1 text-sm">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    <span className="text-foreground">Visible on storefront</span>
                  </label>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={busy} className="flex-1 bg-primary py-3 editorial-eyebrow text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                      {busy ? "Saving…" : editing ? "Save changes" : "Add piece"}
                    </button>
                    <button type="button" onClick={reset} className="border border-input px-4 editorial-eyebrow text-foreground hover:border-primary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}

          {/* List */}
          <section className={showForm ? "lg:col-span-7" : "lg:col-span-12"}>
            <div className="mb-3 flex items-center justify-between">
              <p className="editorial-eyebrow text-muted-foreground">
                Showing {filtered.length} of {items.length}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="border border-dashed border-border bg-card p-12 text-center">
                <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-serif text-lg">
                  {items.length === 0 ? "Your atelier is empty" : "No pieces match these filters"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {items.length === 0 ? "Add your first piece to start curating." : "Try clearing filters or search."}
                </p>
                {items.length === 0 && (
                  <button onClick={startNew} className="mt-4 inline-flex items-center gap-2 bg-primary px-5 py-2.5 editorial-eyebrow text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4" /> Add first piece
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-3 ${showForm ? "" : "md:grid-cols-2"}`}>
                {filtered.map((p) => {
                  const stock = p.stock ?? 0;
                  const isOut = stock <= 0;
                  return (
                    <article
                      key={p.id}
                      className={`group flex gap-4 border border-border bg-card p-3 transition-shadow hover:shadow-[var(--shadow-elegant)] ${!p.active ? "opacity-60" : ""}`}
                      style={{ boxShadow: "var(--shadow-soft)" }}
                    >
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-muted">
                        {p.image_url ? (
                          <img src={resolveImageUrl(p.image_url)} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        {!p.active && (
                          <span className="absolute inset-0 flex items-center justify-center bg-foreground/60 editorial-eyebrow text-[10px] text-background">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="editorial-eyebrow text-muted-foreground">{p.category}</span>
                          {p.badge && (
                            <span className="editorial-eyebrow rounded bg-accent/30 px-1.5 py-0.5 text-[10px] text-foreground">{p.badge}</span>
                          )}
                          {isOut && (
                            <span className="editorial-eyebrow rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] text-destructive">Sold out</span>
                          )}
                        </div>
                        <h3 className="truncate font-serif text-lg">{p.name}</h3>
                        <p className="truncate text-xs text-primary">{p.price}</p>

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center gap-1 border border-input">
                            <button onClick={() => adjustStock(p, -1)} className="flex h-7 w-7 items-center justify-center hover:bg-muted" aria-label="Decrease stock">
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-7 text-center text-sm tabular-nums">{stock}</span>
                            <button onClick={() => adjustStock(p, +1)} className="flex h-7 w-7 items-center justify-center hover:bg-muted" aria-label="Increase stock">
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => toggleActive(p)}
                            className="editorial-eyebrow text-xs text-muted-foreground hover:text-primary"
                          >
                            {p.active ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => startEdit(p)}
                          className="inline-flex items-center gap-1 editorial-eyebrow text-xs text-foreground hover:text-primary"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="inline-flex items-center gap-1 editorial-eyebrow text-xs text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Floating add button when form closed (mobile-friendly) */}
      {!showForm && (
        <button
          onClick={startNew}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform hover:scale-105 lg:hidden"
          aria-label="Add new piece"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

const inputCls = "w-full border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="editorial-eyebrow text-foreground">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

