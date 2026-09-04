import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  describePushBlocker,
  disablePush,
  enablePush,
  isPushEnabled,
  type PushBlocker,
} from "@/lib/push";

const BLOCKER_MESSAGE: Record<NonNullable<PushBlocker>, string> = {
  "ios-needs-install":
    "On iPhone, tap Share → Add to Home Screen, then open Pure Ihram from that icon. Safari only allows notifications for installed apps.",
  "permission-denied":
    "Notifications are blocked for this site in your browser settings. Allow them there, then try again.",
  unsupported: "This browser cannot receive push notifications.",
};

/**
 * Turns order alerts on for the device it is tapped on. Each phone or laptop
 * subscribes separately, so enabling it here does not enable it elsewhere.
 */
export const OrderPushToggle = () => {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);
  const blocker = describePushBlocker();

  useEffect(() => {
    let cancelled = false;
    isPushEnabled().then((value) => {
      if (!cancelled) {
        setEnabled(value);
        setChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (enabled) {
        await disablePush(supabase);
        setEnabled(false);
        toast({ title: "Order alerts off for this device" });
        return;
      }

      const result = await enablePush(supabase);
      if (result.ok) {
        setEnabled(true);
        toast({
          title: "Order alerts on",
          description: "This device will buzz when a new order arrives.",
        });
        return;
      }

      toast({
        title: "Could not turn on alerts",
        description: result.blocker
          ? BLOCKER_MESSAGE[result.blocker]
          : result.error ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }, [busy, enabled, toast]);

  // Explain rather than present a button that cannot work.
  if (blocker) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast({ title: "Order alerts unavailable", description: BLOCKER_MESSAGE[blocker] })
        }
      >
        <BellOff className="w-4 h-4 mr-2" />
        Alerts
      </Button>
    );
  }

  return (
    <Button
      variant={enabled ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={busy || !checked}
      aria-pressed={enabled}
    >
      {busy ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : enabled ? (
        <Bell className="w-4 h-4 mr-2" />
      ) : (
        <BellOff className="w-4 h-4 mr-2" />
      )}
      {enabled ? "Alerts on" : "Alerts off"}
    </Button>
  );
};
