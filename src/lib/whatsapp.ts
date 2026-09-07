/**
 * One-tap "your order is on its way" over WhatsApp.
 *
 * Customers type their number however they like at Stripe: "070-731 22 96",
 * "+46 73 680 51 86", "40 67 75 52". wa.me accepts none of that. It wants
 * digits only, in full international form, with no plus and no spaces, so a
 * number that looks perfectly fine in the admin will silently open an empty
 * WhatsApp chat unless it is normalised first.
 *
 * Nothing here sends anything. It opens WhatsApp with the message written and
 * waits for Rafi to press send, which is the right shape for a message going
 * out under his name.
 */

/** Dial codes for the countries the shop actually ships to. */
const DIAL_CODES: Record<string, string> = {
  SE: "46",
  NO: "47",
  DK: "45",
  FI: "358",
  DE: "49",
  NL: "31",
  BE: "32",
  FR: "33",
  AT: "43",
  IT: "39",
  ES: "34",
  GB: "44",
};

/**
 * Turn a number as typed into the digits wa.me needs, or null when it cannot
 * be trusted. Returning null is deliberate: a wrong number does not fail
 * loudly, it messages a stranger.
 */
export function toWhatsAppNumber(raw: string | null | undefined, country?: string | null): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  // 00 is the international prefix in Europe and means the same as a plus.
  if (!hasPlus && digits.startsWith("00")) {
    digits = digits.slice(2);
    return digits.length >= 8 ? digits : null;
  }

  if (hasPlus) return digits.length >= 8 ? digits : null;

  const dial = country ? DIAL_CODES[country.toUpperCase()] : undefined;

  // A national number: drop the trunk zero and prepend the country's code.
  if (digits.startsWith("0")) {
    if (!dial) return null;
    const national = digits.replace(/^0+/, "");
    return national.length >= 6 ? dial + national : null;
  }

  // Already carries its own country code, e.g. someone typed 46701234567.
  if (dial && digits.startsWith(dial) && digits.length > dial.length + 5) return digits;

  // A bare national number with no trunk zero, which is normal in Norway.
  if (dial && digits.length >= 6 && digits.length <= 10) return dial + digits;

  return digits.length >= 10 ? digits : null;
}

export interface DispatchOrder {
  order_number: string;
  shipping_name?: string | null;
  shipping_country?: string | null;
  quantity?: number | null;
}

/**
 * The dispatch message, in the customer's own language where we have one.
 * Swedish for Sweden, Norwegian for Norway, English everywhere else.
 */
export function dispatchMessage(order: DispatchOrder): string {
  const name = (order.shipping_name || "").trim().split(/\s+/)[0] || "";
  const country = (order.shipping_country || "").toUpperCase();
  const sets = order.quantity && order.quantity > 0 ? order.quantity : 1;

  if (country === "SE") {
    return [
      `Assalamu alaikum${name ? " " + name : ""},`,
      "",
      `Din beställning från Pure Ihram (${order.order_number}) är skickad idag.`,
      `${sets} ${sets === 1 ? "set" : "set"} är på väg och brukar vara framme inom 3 till 7 arbetsdagar.`,
      "",
      "Hör gärna av dig här om något inte stämmer, så löser vi det.",
      "",
      "Jazakum Allahu khayran,",
      "Rafi, Pure Ihram",
    ].join("\n");
  }

  if (country === "NO") {
    return [
      `Assalamu alaikum${name ? " " + name : ""},`,
      "",
      `Bestillingen din fra Pure Ihram (${order.order_number}) er sendt i dag.`,
      `${sets} sett er på vei, og pleier å komme fram innen 3 til 7 virkedager.`,
      "",
      "Si gjerne fra her hvis noe ikke stemmer, så ordner vi det.",
      "",
      "Jazakum Allahu khayran,",
      "Rafi, Pure Ihram",
    ].join("\n");
  }

  return [
    `Assalamu alaikum${name ? " " + name : ""},`,
    "",
    `Your Pure Ihram order (${order.order_number}) was dispatched today.`,
    `${sets} ${sets === 1 ? "set is" : "sets are"} on the way and should reach you within 3 to 7 working days.`,
    "",
    "Just reply here if anything is not right and I will sort it.",
    "",
    "Jazakum Allahu khayran,",
    "Rafi, Pure Ihram",
  ].join("\n");
}

/** Full wa.me link with the message ready to send, or null without a usable number. */
export function whatsappDispatchLink(
  order: DispatchOrder & { customer_phone?: string | null }
): string | null {
  const number = toWhatsAppNumber(order.customer_phone, order.shipping_country);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(dispatchMessage(order))}`;
}

/** A shipping label, ready to paste. */
export function formatAddressForLabel(order: {
  shipping_name?: string | null;
  shipping_address?: Record<string, unknown> | null;
}): string {
  const a = (order.shipping_address ?? {}) as Record<string, string | null>;
  return [
    order.shipping_name,
    a.line1,
    a.line2,
    [a.postal_code, a.city].filter(Boolean).join(" "),
    a.country,
  ]
    .filter((line) => line && String(line).trim())
    .join("\n");
}
