import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  describePushBlocker,
  disablePush,
  enablePush,
  isPushEnabled,
  sendTestPush,
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
 * enrols separately, so enabling here does not enable it elsewhere. Being
 * signed in to the admin is what allows it; there is no separate code.
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

  const turnOn = useCallback(
    async () => {
      setBusy(true);
      try {
        const result = await enablePush();
        if (!result.ok) {
          toast({
            title: "Could not turn on alerts",
            description: result.blocker
              ? BLOCKER_MESSAGE[result.blocker]
              : result.error ?? "Something went wrong.",
            variant: "destructive",
          });
          return false;
        }

        setEnabled(true);
        // Prove it works now rather than leaving him to wonder until an order lands.
        await sendTestPush();
        toast({
          title: "Order alerts on",
          description: "A test notification is on its way to this device.",
        });
        return true;
      } finally {
        setBusy(false);
      }
    },
    [toast]
  );

  const handleClick = useCallback(async () => {
    if (busy) return;

    if (enabled) {
      setBusy(true);
      try {
        await disablePush();
        setEnabled(false);
        toast({ title: "Order alerts off for this device" });
      } finally {
        setBusy(false);
      }
      return;
    }

    await turnOn();
  }, [busy, enabled, toast, turnOn]);

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
