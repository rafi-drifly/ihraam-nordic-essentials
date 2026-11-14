import { ReactNode } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

/**
 * Gates an admin route on a Cloudflare Access session the Worker accepts.
 *
 * A convenience for the operator, not the security boundary: Access stops a
 * signed-out browser before the page loads, and the Worker checks the session
 * again on every data request, so a tampered client still gets nothing back.
 */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { loading, email, error } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">Cannot open the admin</h1>
          <p className="text-muted-foreground text-sm">{error}</p>
          <p className="text-muted-foreground text-sm">
            <a className="underline" href="/cdn-cgi/access/logout">
              Sign out
            </a>{" "}
            and sign in again with the admin email.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
