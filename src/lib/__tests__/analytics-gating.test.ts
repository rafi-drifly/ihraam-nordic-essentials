/**
 * Analytics are gated to the live storefront.
 *
 * The app is only ever configured with the production PostHog project (there is
 * no separate dev project), so anything running off the real domain - a local
 * `bun run dev`, a Lovable preview URL - must stay silent or it writes fake
 * traffic and fake people into the real dataset.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureMock = vi.fn();
const identifyMock = vi.fn();
const registerMock = vi.fn();
const resetMock = vi.fn();

vi.mock("posthog-js", () => ({
  default: {
    capture: (...a: unknown[]) => captureMock(...a),
    identify: (...a: unknown[]) => identifyMock(...a),
    register: (...a: unknown[]) => registerMock(...a),
    reset: (...a: unknown[]) => resetMock(...a),
  },
}));

import {
  identifyUser,
  isAnalyticsEnabled,
  resetUser,
  trackEvent,
  trackPageView,
  trackPurchase,
} from "../analytics";

/** jsdom will not let `location` be reassigned, so swap the global outright. */
function setHostname(hostname: string) {
  vi.stubGlobal("location", { ...window.location, hostname });
}

beforeEach(() => {
  captureMock.mockClear();
  identifyMock.mockClear();
  registerMock.mockClear();
  resetMock.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("on the live storefront", () => {
  it("is enabled on the apex and www domains", () => {
    setHostname("pureihram.com");
    expect(isAnalyticsEnabled()).toBe(true);
    setHostname("www.pureihram.com");
    expect(isAnalyticsEnabled()).toBe(true);
  });

  it("sends events", () => {
    setHostname("pureihram.com");
    trackEvent("add_to_cart_single", { qty: 1 });
    trackPurchase({ order_id: "cs_1", total: 46, item_count: 2 });
    identifyUser("pilgrim@example.com");
    expect(captureMock).toHaveBeenCalledTimes(2);
    expect(identifyMock).toHaveBeenCalledTimes(1);
  });
});

describe("everywhere else", () => {
  const offDomain = ["localhost", "127.0.0.1", "id-preview--998852f8.lovable.app", "ihraam-nordic-essentials.lovable.app"];

  it.each(offDomain)("is disabled on %s", (hostname) => {
    setHostname(hostname);
    expect(isAnalyticsEnabled()).toBe(false);
  });

  it.each(offDomain)("sends nothing at all from %s", (hostname) => {
    setHostname(hostname);
    trackEvent("add_to_cart_single", { qty: 1 });
    trackPurchase({ order_id: "cs_dev", total: 46, item_count: 2 });
    trackPageView({ path: "/", pageType: "home", locale: "en" });
    identifyUser("developer@example.com");
    resetUser();

    expect(captureMock).not.toHaveBeenCalled();
    // register and identify would create a real person profile from a test email.
    expect(registerMock).not.toHaveBeenCalled();
    expect(identifyMock).not.toHaveBeenCalled();
    expect(resetMock).not.toHaveBeenCalled();
  });

  it("is not fooled by a lookalike domain", () => {
    setHostname("pureihram.com.evil.example");
    expect(isAnalyticsEnabled()).toBe(false);
    setHostname("notpureihram.com");
    expect(isAnalyticsEnabled()).toBe(false);
  });
});
