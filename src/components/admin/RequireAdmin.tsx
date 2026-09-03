import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";

/**
 * Gates an admin route on a real session plus the admin role.
 *
 * This is a convenience for the operator, not the security boundary: the
 * database enforces access through RLS, so a tampered client still gets
 * nothing back.
 */
export const RequireAdmin = ({ children }: { children: ReactNode }) => {
  const { loading, session, isAdmin } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-semibold">Not an admin account</h1>
          <p className="text-muted-foreground text-sm">
            You are signed in, but this account does not have the admin role.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
