import { useEffect, useState } from "react";
import { adminHasSession } from "@/lib/adminApi";

/**
 * Whether this browser is signed in to the admin, according to the Worker.
 *
 * Only lets the pages decide between showing themselves and sending the
 * browser to the password page. The protection is the Worker's own check of
 * the session on every request, not this hook.
 */
export interface AdminAuthState {
  loading: boolean;
  signedIn: boolean;
  error: string | null;
}

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ loading: true, signedIn: false, error: null });

  useEffect(() => {
    let cancelled = false;
    adminHasSession()
      .then((signedIn) => {
        if (!cancelled) setState({ loading: false, signedIn, error: null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({ loading: false, signedIn: false, error: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export { adminSignOut } from "@/lib/adminApi";
