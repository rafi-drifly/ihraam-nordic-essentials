import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

/**
 * Shows an admin page only to a signed-in browser; anyone else goes to the
 * password page and comes back here afterwards.
 *
 * A convenience, not the security boundary: the Worker checks the session on
 * every data request, so a tampered page still gets nothing back.
 */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { loading, signedIn, error } = useAdminAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">Cannot open the admin</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <button className="text-sm underline" onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!signedIn) return <Navigate to={`/admin?next=${encodeURIComponent(pathname)}`} replace />;

  return <>{children}</>;
};
