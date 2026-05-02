import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign in — The Peng Collection Admin" }],
  }),
  component: Login,
});

function Login() {
  const { signIn, signUp, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate({ to: "/admin" });
  }, [user, isAdmin, loading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
    } else if (mode === "signup") {
      toast.success("Account created — tell Lovable to grant admin access.");
    } else {
      toast.success("Welcome back, Fatima ✨");
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-secondary/60 to-background px-5">
      <div className="w-full max-w-md">
        <Link to="/" className="editorial-eyebrow text-primary">← The Peng Collection</Link>
        <h1 className="mt-4 font-serif text-4xl">
          {mode === "signin" ? "Admin sign in" : "Create admin account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your collection — add, edit and remove products.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 bg-card p-7 shadow-soft" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div>
            <label className="editorial-eyebrow text-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="editorial-eyebrow text-foreground">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary py-4 editorial-eyebrow text-primary-foreground transition-colors hover:bg-burgundy disabled:opacity-50"
          >
            {submitting ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "First time? Create your admin account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
