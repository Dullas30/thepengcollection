import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, resolveImageUrl, type DBProduct } from "@/lib/products-db";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Package, Search, Plus, Minus, Pencil, Trash2, Upload, X, ImageIcon,
  LogOut, ExternalLink, Filter, Shirt, Images, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — The Peng Collection" }],
  }),
  component: AdminPage,
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

type FilterStatus = "all" | "in" | "out";
type FilterCat = "All" | (typeof CATEGORIES)[number];

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/login" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--gradient-editorial)] text-muted-foreground">
        <Sparkles className="h-5 w-5 animate-pulse text-primary" />
        <p className="editorial-eyebrow">Opening the atelier…</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[var(--gradient-editorial)]">
        <AdminSidebar onSignOut={async () => { await signOut(); navigate({ to: "/" }); }} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 md:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <SidebarTrigger className="-ml-1 hover:text-primary" />
                <div className="hidden h-6 w-px bg-border sm:block" />
                <div className="min-w-0">
                  <p className="editorial-eyebrow text-primary/80">Atelier · Catalogue</p>
                  <h1 className="truncate font-display text-lg leading-tight text-foreground md:text-xl">
                    The Peng Collection
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <Link
                  to="/"
                  className="hidden items-center gap-1.5 border border-border bg-card px-3 py-2 editorial-eyebrow text-foreground transition-colors hover:border-primary hover:text-primary sm:inline-flex"
                >
                  View site <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                  className="inline-flex items-center gap-1.5 px-2 py-2 editorial-eyebrow text-foreground/70 transition-colors hover:text-primary"
                >
                  <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            </div>
            <div className="gold-rule opacity-70" />
          </header>

          <main className="flex-1 px-4 py-7 md:px-8 md:py-10">
            <ProductsManager />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AdminSidebar({ onSignOut }: { onSignOut: () => void }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="border-b border-border bg-card/50">
        <div className="flex items-center gap-3 px-1 py-2.5">
          <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center bg-primary text-primary-foreground">
            <span className="font-display text-xl leading-none">P</span>
            <span className="absolute -bottom-px left-1.5 right-1.5 h-px bg-[var(--gold)]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="editorial-eyebrow text-primary/80">Atelier</p>
              <p className="truncate font-display text-base">The Peng Collection</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-card/30">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="editorial-eyebrow text-muted-foreground">Manage</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground">
                  <Shirt className="h-4 w-4" />
                  {!collapsed && <span className="editorial-eyebrow text-xs">Products</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin/lookbook" className="flex items-center gap-2">
                    <Images className="h-4 w-4" />
                    {!collapsed && <span className="editorial-eyebrow text-xs">Lookbook</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border bg-card/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                {!collapsed && <span className="editorial-eyebrow text-xs">View storefront</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
              {!collapsed && <span className="editorial-eyebrow text-xs">Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function ProductsManager() {
  const [items, setItems] = useState<DBProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<FilterCat>("All");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setItems((data ?? []) as DBProduct[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => ({
    total: items.length,
    inStock: items.filter((p) => (p.stock ?? 0) > 0).length,
    out: items.filter((p) => (p.stock ?? 0) <= 0).length,
  }), [items]);

  const filtered = useMemo(() => items.filter((p) => {
    if (filterCat !== "All" && p.category !== filterCat) return false;
    if (filterStatus === "in" && (p.stock ?? 0) <= 0) return false;
    if (filterStatus === "out" && (p.stock ?? 0) > 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.description ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  }), [items, filterCat, filterStatus, search]);

  const reset = () => { setForm(empty); setEditing(false); setShowForm(false); };
  const startNew = () => { setForm(empty); setEditing(false); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const startEdit = (p: DBProduct) => {
    setForm({
      id: p.id, name: p.name, category: p.category, price: p.price,
      description: p.description ?? "", badge: p.badge ?? "",
      active: p.active, stock: p.stock ?? 0, image_url: p.image_url,
    });
    setEditing(true); setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `products/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });
    setUploading(false);
    if (error) return toast.error(error.message);
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
    reset(); load();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Remove this piece from the collection?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed"); load();
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

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Section heading */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="editorial-eyebrow text-primary/80">The Collection</p>
          <h2 className="mt-1.5 font-display text-3xl text-foreground md:text-4xl">Curate your pieces</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Add new arrivals, refine descriptions, adjust availability — all in one quiet workspace.
          </p>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <Stat label="Pieces" value={counts.total} />
          <span className="h-8 w-px bg-border" />
          <Stat label="In stock" value={counts.inStock} accent />
          <span className="h-8 w-px bg-border" />
          <Stat label="Sold out" value={counts.out} />
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="flex flex-col gap-3 border border-border bg-card p-3 sm:p-4 md:flex-row md:items-center"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
          <Filter className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value as FilterCat)}
            className="flex-1 border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none md:flex-none"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button
          onClick={startNew}
          className="group inline-flex items-center justify-center gap-2 bg-primary px-5 py-2.5 editorial-eyebrow text-primary-foreground transition-all hover:bg-[var(--rose)] hover:shadow-[var(--shadow-soft)]"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" /> New piece
        </button>
      </div>

      {/* Status segmented control */}
      <div className="mt-4 inline-flex flex-wrap items-center gap-0 border border-border bg-card p-1">
        {([
          ["all", `All · ${counts.total}`],
          ["in", `In stock · ${counts.inStock}`],
          ["out", `Sold out · ${counts.out}`],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key as FilterStatus)}
            className={`editorial-eyebrow px-3.5 py-2 text-xs transition-colors ${
              filterStatus === key
                ? "bg-primary text-primary-foreground"
                : "text-foreground/60 hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-7 grid gap-6 md:gap-8 lg:grid-cols-12">
        {showForm && (
          <section className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-border bg-card" style={{ boxShadow: "var(--shadow-elegant)" }}>
              <div className="relative border-b border-border bg-secondary/50 px-6 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="editorial-eyebrow text-primary/80">{editing ? "Editing piece" : "Adding piece"}</p>
                    <h3 className="mt-1 truncate font-display text-2xl text-foreground">
                      {editing ? form.name || "Untitled" : "A new arrival"}
                    </h3>
                  </div>
                  <button onClick={reset} aria-label="Close" className="p-1.5 text-muted-foreground transition-colors hover:text-primary">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="gold-rule absolute bottom-0 left-0 right-0 opacity-60" />
              </div>

              <form onSubmit={onSubmit} className="space-y-5 p-6">
                <Field label="Name">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                      {form.image_url ? (
                        <img src={resolveImageUrl(form.image_url)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--gold)]/20" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 border border-input bg-background px-3.5 py-2 editorial-eyebrow text-foreground transition-colors hover:border-primary hover:text-primary">
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

                <label className="flex items-center gap-2.5 border-t border-border pt-4 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    className="h-4 w-4 accent-[var(--burgundy)]"
                  />
                  <span className="text-foreground">Visible on storefront</span>
                </label>

                <div className="flex gap-3 pt-1">
                  <button type="submit" disabled={busy} className="flex-1 bg-primary py-3 editorial-eyebrow text-primary-foreground transition-colors hover:bg-[var(--rose)] disabled:opacity-50">
                    {busy ? "Saving…" : editing ? "Save changes" : "Add piece"}
                  </button>
                  <button type="button" onClick={reset} className="border border-input px-5 editorial-eyebrow text-foreground transition-colors hover:border-primary hover:text-primary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* List */}
        <section className={showForm ? "lg:col-span-7" : "lg:col-span-12"}>
          <div className="mb-4 flex items-center justify-between">
            <p className="editorial-eyebrow text-muted-foreground">
              Showing {filtered.length} of {items.length}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="relative overflow-hidden border border-dashed border-border bg-card p-12 text-center md:p-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border bg-secondary/40">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-5 font-display text-2xl text-foreground">
                {items.length === 0 ? "Your atelier is empty" : "No pieces match these filters"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {items.length === 0 ? "Add your first piece to start curating." : "Try clearing filters or search."}
              </p>
              {items.length === 0 && (
                <button onClick={startNew} className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 editorial-eyebrow text-primary-foreground hover:bg-[var(--rose)]">
                  <Plus className="h-4 w-4" /> Add first piece
                </button>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${showForm ? "" : "md:grid-cols-2"}`}>
              {filtered.map((p) => {
                const stock = p.stock ?? 0;
                const isOut = stock <= 0;
                return (
                  <article
                    key={p.id}
                    className={`group relative flex flex-col gap-4 border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-elegant)] sm:flex-row ${!p.active ? "opacity-60" : ""}`}
                    style={{ boxShadow: "var(--shadow-soft)" }}
                  >
                    <div className="relative h-40 w-full flex-shrink-0 overflow-hidden bg-muted sm:h-28 sm:w-28">
                      {p.image_url ? (
                        <img src={resolveImageUrl(p.image_url)} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--gold)]/15" />
                      {!p.active && (
                        <span className="absolute inset-0 flex items-center justify-center bg-foreground/60 editorial-eyebrow text-[10px] text-background">
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="editorial-eyebrow text-primary/80">{p.category}</span>
                        {p.badge && (
                          <span className="editorial-eyebrow border border-[var(--gold)]/50 bg-secondary/40 px-2 py-0.5 text-[10px] text-foreground">{p.badge}</span>
                        )}
                        {isOut && (
                          <span className="editorial-eyebrow bg-destructive/15 px-2 py-0.5 text-[10px] text-destructive">Sold out</span>
                        )}
                      </div>
                      <h3 className="mt-1 truncate font-display text-xl text-foreground">{p.name}</h3>
                      <p className="truncate text-xs font-medium text-primary">{p.price}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-0 border border-input bg-background">
                          <button onClick={() => adjustStock(p, -1)} className="flex h-8 w-8 items-center justify-center text-foreground/70 transition-colors hover:bg-secondary hover:text-primary" aria-label="Decrease stock">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-8 border-x border-input px-2 text-center text-sm tabular-nums">{stock}</span>
                          <button onClick={() => adjustStock(p, +1)} className="flex h-8 w-8 items-center justify-center text-foreground/70 transition-colors hover:bg-secondary hover:text-primary" aria-label="Increase stock">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => toggleActive(p)}
                          className="editorial-eyebrow text-xs text-muted-foreground transition-colors hover:text-primary"
                        >
                          {p.active ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-row items-center gap-4 border-t border-border pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-0 sm:pt-0">
                      <button
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center gap-1.5 editorial-eyebrow text-xs text-foreground transition-colors hover:text-primary"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="inline-flex items-center gap-1.5 editorial-eyebrow text-xs text-muted-foreground transition-colors hover:text-destructive"
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

      {/* Floating add button on mobile when form closed */}
      {!showForm && (
        <button
          onClick={startNew}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center bg-primary text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:scale-105 hover:bg-[var(--rose)] lg:hidden"
          aria-label="Add new piece"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

const inputCls = "w-full border border-input bg-background px-3.5 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="editorial-eyebrow text-foreground/80">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex flex-col items-end">
      <span className={`font-display text-2xl leading-none ${accent ? "text-primary" : "text-foreground"}`}>{value}</span>
      <span className="editorial-eyebrow mt-1 text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
