import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  describePushBlocker,
  disablePush,
  enablePush,
  isPushEnabled,
  rememberedCode,
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
 * enrols separately, so enabling here does not enable it elsewhere.
 */
export const OrderPushToggle = () => {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);
  const [askingForCode, setAskingForCode] = useState(false);
  const [code, setCode] = useState("");
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
    async (enrolmentCode: string) => {
      setBusy(true);
      try {
        const result = await enablePush(enrolmentCode);
        if (!result.ok) {
          toast({
            title: "Could not turn on alerts",
            description: result.blocker
              ? BLOCKER_MESSAGE[result.blocker]
              : result.error ?? "Something went wrong.",
            variant: "destructive",
          });
          // Wrong code: keep the dialog open so it can be corrected.
          return false;
        }

        setEnabled(true);
        setAskingForCode(false);
        // Prove it works now rather than leaving him to wonder until an order lands.
        await sendTestPush(enrolmentCode);
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
        await disablePush(rememberedCode());
        setEnabled(false);
        toast({ title: "Order alerts off for this device" });
      } finally {
        setBusy(false);
      }
      return;
    }

    const saved = rememberedCode();
    if (saved) {
      await turnOn(saved);
      return;
    }
    setCode("");
    setAskingForCode(true);
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
    <>
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

      <Dialog open={askingForCode} onOpenChange={setAskingForCode}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Turn on order alerts</DialogTitle>
            <DialogDescription>
              Enter your enrolment code to let this device receive notifications when an order
              arrives. You only need to do this once per device.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (code.trim()) void turnOn(code.trim().toUpperCase());
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="enrolment-code">Enrolment code</Label>
              <Input
                id="enrolment-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                autoComplete="one-time-code"
                autoFocus
                className="font-mono tracking-wider"
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={busy || !code.trim()} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Turn on alerts
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
