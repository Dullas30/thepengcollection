import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;

    const checkAdmin = async (userId: string): Promise<boolean> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (error) {
        console.error("[auth] role check failed:", error.message);
        return false;
      }
      return !!data;
    };

    const applySession = async (sess: Session | null) => {
      if (!alive) return;
      setSession(sess);
      setUser(sess?.user ?? null);

      const uid = sess?.user?.id ?? null;
      if (!uid) {
        lastUserId.current = null;
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Avoid re-running admin check for the same user on token refreshes
      if (lastUserId.current === uid && !loading) {
        setLoading(false);
        return;
      }
      lastUserId.current = uid;

      const admin = await checkAdmin(uid);
      if (!alive) return;
      setIsAdmin(admin);
      setLoading(false);
    };

    // Listener first (do NOT ignore INITIAL_SESSION — it's our source of truth on hydrate)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      // Defer to avoid Supabase deadlock when calling supabase from inside callback
      setTimeout(() => { void applySession(sess); }, 0);
    });

    // Fallback in case INITIAL_SESSION never fires
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      void applySession(s);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ session, user, isAdmin, loading, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be inside AuthProvider");
  return v;
}
