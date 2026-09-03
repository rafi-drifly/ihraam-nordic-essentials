import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Real admin authentication.
 *
 * The previous gate compared a password that was compiled into the public
 * JavaScript bundle and then set localStorage.pureihram_admin = "true", which
 * anyone could set from devtools. It also meant the browser stayed anonymous to
 * Supabase, so the "Admins can view all orders" policy never matched and the
 * orders page could not load a single row.
 *
 * This signs in against Supabase Auth and checks the admin role in the database
 * via has_role(). The client-side check drives the UI; the actual protection is
 * the RLS policy on the server, which no amount of devtools can talk past.
 */
export interface AdminAuthState {
  loading: boolean;
  session: Session | null;
  isAdmin: boolean;
}

async function checkAdminRole(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) {
    console.error("Admin role check failed:", error);
    return false;
  }
  return data === true;
}

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    loading: true,
    session: null,
    isAdmin: false,
  });

  useEffect(() => {
    let cancelled = false;

    const apply = async (session: Session | null) => {
      if (!session?.user) {
        if (!cancelled) setState({ loading: false, session: null, isAdmin: false });
        return;
      }
      const isAdmin = await checkAdminRole(session.user.id);
      if (!cancelled) setState({ loading: false, session, isAdmin });
    };

    supabase.auth.getSession().then(({ data }) => apply(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Role lookup is async; defer so it never runs inside the auth callback.
      setTimeout(() => apply(session), 0);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}
