import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

type RequestType = "return" | "exchange" | "issue";

interface ReturnRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: RequestType;
}

const ReturnRequestDialog = ({
  open,
  onOpenChange,
  defaultType = "return",
}: ReturnRequestDialogProps) => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    type: defaultType,
    reason: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setFormData({ name: "", email: "", orderNumber: "", type: defaultType, reason: "", message: "" });
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("returns.dialog.title")}</DialogTitle>
          <DialogDescription>{t("returns.dialog.subtitle")}</DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("returns.dialog.successTitle")}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {t("returns.dialog.successMessage")}
            </p>
            <Button onClick={() => handleClose(false)}>
              {t("returns.dialog.close")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("returns.dialog.name")}</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("returns.dialog.namePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("returns.dialog.email")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("returns.dialog.emailPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderNumber">{t("returns.dialog.orderNumber")}</Label>
              <Input
                id="orderNumber"
                required
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                placeholder={t("returns.dialog.orderNumberPlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("returns.dialog.requestType")}</Label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val as RequestType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="return">{t("returns.dialog.typeReturn")}</SelectItem>
                  <SelectItem value="exchange">{t("returns.dialog.typeExchange")}</SelectItem>
                  <SelectItem value="issue">{t("returns.dialog.typeIssue")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("returns.dialog.reason")}</Label>
              <Select
                value={formData.reason}
                onValueChange={(val) => setFormData({ ...formData, reason: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("returns.dialog.reasonPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="changed_mind">{t("returns.dialog.reasons.changedMind")}</SelectItem>
                  <SelectItem value="wrong_size">{t("returns.dialog.reasons.wrongSize")}</SelectItem>
                  <SelectItem value="defective">{t("returns.dialog.reasons.defective")}</SelectItem>
                  <SelectItem value="wrong_item">{t("returns.dialog.reasons.wrongItem")}</SelectItem>
                  <SelectItem value="damaged">{t("returns.dialog.reasons.damaged")}</SelectItem>
                  <SelectItem value="other">{t("returns.dialog.reasons.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t("returns.dialog.message")}</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t("returns.dialog.messagePlaceholder")}
                rows={3}
              />
            </div>
            <Button type="submit" className="w-full">
              {t("returns.dialog.submit")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReturnRequestDialog;
