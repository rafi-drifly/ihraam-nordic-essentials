import { useEffect, useState } from "react";
import { adminGet, AdminSignInRequired } from "@/lib/adminApi";

/**
 * Who is signed in to the admin, according to the Worker.
 *
 * The login itself is Cloudflare Access, in front of /admin and /api/admin.
 * This only asks the Worker which Access identity it sees, so the pages can
 * show the account and redirect to the login when the session has ended. The
 * protection is the Worker's own check on every request, not this hook.
 */
export interface AdminAuthState {
  loading: boolean;
  email: string | null;
  error: string | null;
}

export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ loading: true, email: null, error: null });

  useEffect(() => {
    let cancelled = false;
    adminGet<{ email: string }>("me")
      .then(({ email }) => {
        if (!cancelled) setState({ loading: false, email, error: null });
      })
      .catch((error: unknown) => {
        // Already on its way to the login page; keep showing the spinner.
        if (cancelled || error instanceof AdminSignInRequired) return;
        setState({ loading: false, email: null, error: error instanceof Error ? error.message : String(error) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export { adminSignOut } from "@/lib/adminApi";
