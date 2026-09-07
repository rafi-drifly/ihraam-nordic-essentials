import { describe, expect, it } from "vitest";
import {
  dispatchMessage,
  formatAddressForLabel,
  toWhatsAppNumber,
  whatsappDispatchLink,
} from "../whatsapp";

/**
 * Every number below is a real format taken from an actual Stripe checkout on
 * this shop. A wrong result here does not throw, it opens a WhatsApp chat with
 * a stranger, so the cases are the ones that have really occurred.
 */
describe("normalising numbers for wa.me", () => {
  it("handles the Swedish national format customers actually type", () => {
    expect(toWhatsAppNumber("070-731 22 96", "SE")).toBe("46707312296");
    expect(toWhatsAppNumber("076-328 39 18", "SE")).toBe("46763283918");
  });

  it("keeps numbers that already carry their country code", () => {
    expect(toWhatsAppNumber("+46 73 680 51 86", "SE")).toBe("46736805186");
    expect(toWhatsAppNumber("+4794483465", "NO")).toBe("4794483465");
    expect(toWhatsAppNumber("+46764403672", "SE")).toBe("46764403672");
  });

  it("expands a bare Norwegian eight-digit number", () => {
    // Abdullah Bakhsh gave "40 67 75 52" with no zero and no country code.
    expect(toWhatsAppNumber("40 67 75 52", "NO")).toBe("4740677552");
  });

  it("treats 00 as a plus", () => {
    expect(toWhatsAppNumber("0046701234567", "SE")).toBe("46701234567");
  });

  it("does not invent a number it cannot resolve", () => {
    expect(toWhatsAppNumber(null, "SE")).toBeNull();
    expect(toWhatsAppNumber("", "SE")).toBeNull();
    expect(toWhatsAppNumber("not a phone", "SE")).toBeNull();
    // A national number with no country to attach it to.
    expect(toWhatsAppNumber("070-731 22 96", null)).toBeNull();
    expect(toWhatsAppNumber("+123", "SE")).toBeNull();
  });

  it("never returns a plus or a space, which wa.me rejects", () => {
    for (const raw of ["+46 73 680 51 86", "070-731 22 96", "40 67 75 52"]) {
      const n = toWhatsAppNumber(raw, raw.startsWith("4") && !raw.startsWith("+46") ? "NO" : "SE");
      expect(n).toMatch(/^\d+$/);
    }
  });
});

describe("the dispatch message", () => {
  it("writes Swedish to a Swedish customer and uses their first name", () => {
    const m = dispatchMessage({
      order_number: "ORD-BF-43217BA67A",
      shipping_name: "Lavdim Dibrani",
      shipping_country: "SE",
      quantity: 10,
    });
    expect(m).toContain("Assalamu alaikum Lavdim");
    expect(m).toContain("ORD-BF-43217BA67A");
    expect(m).toContain("skickad idag");
    expect(m).toContain("Rafi, Pure Ihram");
  });

  it("writes Norwegian to Norway", () => {
    const m = dispatchMessage({
      order_number: "ORD-1",
      shipping_name: "Yusef Ishqair",
      shipping_country: "NO",
      quantity: 3,
    });
    expect(m).toContain("sendt i dag");
    expect(m).toContain("3 sett");
  });

  it("falls back to English elsewhere and gets singular right", () => {
    const m = dispatchMessage({
      order_number: "ORD-2",
      shipping_name: "Amina Yusuf",
      shipping_country: "DE",
      quantity: 1,
    });
    expect(m).toContain("dispatched today");
    expect(m).toContain("1 set is on the way");
  });

  it("stays polite when Stripe gave us no name", () => {
    const m = dispatchMessage({ order_number: "ORD-3", shipping_name: null, shipping_country: "SE" });
    expect(m.startsWith("Assalamu alaikum,")).toBe(true);
  });
});

describe("the wa.me link", () => {
  it("is ready to open with the message already written", () => {
    const link = whatsappDispatchLink({
      order_number: "ORD-BF-43217BA67A",
      shipping_name: "Lavdim Dibrani",
      shipping_country: "SE",
      quantity: 10,
      customer_phone: "070-731 22 96",
    });
    expect(link).not.toBeNull();
    expect(link!.startsWith("https://wa.me/46707312296?text=")).toBe(true);
    expect(decodeURIComponent(link!.split("?text=")[1])).toContain("ORD-BF-43217BA67A");
  });

  it("is null when there is no usable number, so the button can hide itself", () => {
    // Mifrah Iqbal's payment link collected no phone at all.
    expect(
      whatsappDispatchLink({ order_number: "ORD-4", shipping_country: "NO", customer_phone: null })
    ).toBeNull();
  });
});

describe("the shipping label", () => {
  it("lays the address out the way it goes on a parcel", () => {
    expect(
      formatAddressForLabel({
        shipping_name: "Ayu Rizqita Putri",
        shipping_address: {
          line1: "Lergöksgatan 5E Lgh 1303",
          line2: null,
          postal_code: "42150",
          city: "Västra Frölunda",
          country: "SE",
        },
      })
    ).toBe("Ayu Rizqita Putri\nLergöksgatan 5E Lgh 1303\n42150 Västra Frölunda\nSE");
  });

  it("drops blank lines rather than leaving gaps", () => {
    expect(
      formatAddressForLabel({ shipping_name: "Hana Mohamad", shipping_address: { city: "Borås", country: "SE" } })
    ).toBe("Hana Mohamad\nBorås\nSE");
  });
});
