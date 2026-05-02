import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
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
  sort_order: number;
  image_url: string | null;
};

const empty: Form = {
  name: "",
  category: "Abayas",
  price: "Price on request",
  description: "",
  badge: "",
  active: true,
  sort_order: 0,
  image_url: null,
};

function Admin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<DBProduct[]>([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/login" });
  }, [user, isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) {
      toast.error(error.message);
      return;
    }
    setItems((data ?? []) as DBProduct[]);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

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
      sort_order: p.sort_order,
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
      sort_order: form.sort_order,
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
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
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

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-12 md:px-8">
        {/* Form */}
        <section className="md:col-span-5">
          <div className="sticky top-6 bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
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
                <Field label="Sort order">
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} className={inputCls} />
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
                <button type="submit" disabled={busy} className="flex-1 bg-primary py-3 editorial-eyebrow text-primary-foreground hover:bg-burgundy disabled:opacity-50">
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
          <div className="flex items-center justify-between">
            <p className="editorial-eyebrow text-primary">Collection · {items.length}</p>
          </div>
          <div className="mt-4 space-y-3">
            {items.length === 0 && (
              <p className="text-sm text-muted-foreground">No pieces yet. Add your first one →</p>
            )}
            {items.map((p) => (
              <article key={p.id} className="flex items-center gap-4 bg-card p-3" style={{ boxShadow: "var(--shadow-soft)" }}>
                <div className="h-20 w-20 flex-shrink-0 bg-muted">
                  {p.image_url && (
                    <img src={resolveImageUrl(p.image_url)} alt={p.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="editorial-eyebrow text-muted-foreground">{p.category}</p>
                    {!p.active && <span className="editorial-eyebrow text-destructive">· Hidden</span>}
                  </div>
                  <h3 className="truncate font-serif text-lg">{p.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">{p.price}</p>
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <button onClick={() => startEdit(p)} className="editorial-eyebrow text-foreground hover:text-primary">Edit</button>
                  <button onClick={() => toggleActive(p)} className="editorial-eyebrow text-muted-foreground hover:text-primary">
                    {p.active ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => onDelete(p.id)} className="editorial-eyebrow text-muted-foreground hover:text-destructive">Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
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
