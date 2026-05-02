import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/lookbook")({
  head: () => ({ meta: [{ title: "Lookbook · Admin — The Peng Collection" }] }),
  component: LookbookAdmin,
});

type LookbookImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

function publicUrl(path: string) {
  if (path.startsWith("http")) return path;
  return supabase.storage.from("lookbook").getPublicUrl(path).data.publicUrl;
}

function LookbookAdmin() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<LookbookImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/login" });
  }, [user, isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("lookbook_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setItems((data ?? []) as LookbookImage[]);
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    let ok = 0;
    for (const file of files) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `lookbook/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from("lookbook")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) { toast.error(`${file.name}: ${up.error.message}`); continue; }
      const ins = await supabase
        .from("lookbook_images")
        .insert({ image_url: path, caption: caption.trim() || null });
      if (ins.error) { toast.error(ins.error.message); continue; }
      ok++;
    }
    setUploading(false);
    setCaption("");
    if (ok > 0) toast.success(`${ok} image${ok === 1 ? "" : "s"} added to lookbook`);
    e.target.value = "";
    load();
  };

  const onDelete = async (img: LookbookImage) => {
    if (!confirm("Remove this image from the lookbook?")) return;
    // Best-effort: remove from storage first (only if it's a storage path)
    if (!img.image_url.startsWith("http")) {
      await supabase.storage.from("lookbook").remove([img.image_url]);
    }
    const { error } = await supabase.from("lookbook_images").delete().eq("id", img.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
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
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <div>
            <p className="editorial-eyebrow text-primary">Admin · Lookbook</p>
            <h1 className="font-serif text-2xl">The Peng Collection</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="editorial-eyebrow text-foreground hover:text-primary">Products →</Link>
            <Link to="/lookbook" className="editorial-eyebrow text-foreground hover:text-primary">View page →</Link>
            <button
              onClick={() => { signOut(); navigate({ to: "/" }); }}
              className="editorial-eyebrow text-foreground hover:text-primary"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        {/* Upload */}
        <div className="bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
          <p className="editorial-eyebrow text-primary">Upload images</p>
          <h2 className="mt-1 font-serif text-2xl">Add to the lookbook</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You can select multiple images at once. Caption is optional and applies to this batch.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              maxLength={120}
              className="border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <label className={`cursor-pointer bg-primary px-6 py-2.5 text-center editorial-eyebrow text-primary-foreground hover:bg-primary/90 ${uploading ? "opacity-60" : ""}`}>
              {uploading ? "Uploading…" : "Choose images"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-8">
          <p className="editorial-eyebrow text-muted-foreground">Lookbook · {items.length} {items.length === 1 ? "image" : "images"}</p>
          {items.length === 0 ? (
            <div className="mt-4 bg-card p-10 text-center text-sm text-muted-foreground" style={{ boxShadow: "var(--shadow-soft)" }}>
              No images yet — upload your first one above.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((img) => (
                <figure key={img.id} className="group relative aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={publicUrl(img.image_url)}
                    alt={img.caption ?? "Lookbook"}
                    className="h-full w-full object-cover"
                  />
                  {img.caption && (
                    <figcaption className="absolute bottom-2 left-2 bg-background/85 px-2 py-1 text-[10px] editorial-eyebrow text-primary">
                      {img.caption}
                    </figcaption>
                  )}
                  <button
                    onClick={() => onDelete(img)}
                    className="absolute right-2 top-2 bg-destructive px-2.5 py-1 text-[10px] editorial-eyebrow text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
