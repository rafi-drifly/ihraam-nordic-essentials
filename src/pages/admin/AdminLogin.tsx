import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminHasSession, adminSignIn } from "@/lib/adminApi";

/**
 * /admin: the admin's password page, like the Yalla Jerky admin's.
 *
 * The password goes to the Worker, which answers with a session cookie; this
 * page never stores it. A browser that is already signed in goes straight on.
 */
const AdminLogin = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Only back into the admin, never to another site.
  const requested = params.get("next") ?? "";
  const next = /^\/admin\/[a-z-]+$/.test(requested) ? requested : "/admin/orders";

  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminHasSession()
      .then((signedIn) => {
        if (cancelled) return;
        if (signedIn) navigate(next, { replace: true });
        else setChecking(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate, next]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await adminSignIn(password, remember);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Please try again.");
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Signing in...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-normal">Pure Ihram admin</h1>
        <Input
          type="password"
          placeholder="Admin password"
          aria-label="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Keep me signed in on this device
        </label>
        <Button type="submit" disabled={submitting || !password} className="w-full font-bold">
          {submitting ? "Checking..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
