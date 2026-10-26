import { afterEach, describe, expect, it, vi } from "vitest";
import worker, { parseContact, parsePrepPack, type Env } from "../../../workers/api/src/index";

/** Records every statement the handlers run, in order. */
function fakeDb() {
  const statements: { sql: string; args: unknown[] }[] = [];
  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            run: async () => {
              statements.push({ sql, args });
              return {};
            },
          };
        },
      };
    },
  };
  return { statements, db: db as unknown as Env["DB"] };
}

function makeEnv(overrides: Partial<Env> = {}) {
  const { statements, db } = fakeDb();
  const env: Env = {
    DB: db,
    ALLOWED_ORIGINS: "https://www.pureihram.com,https://pureihram.com",
    KLAVIYO_COMPANY_ID: "TGazgN",
    KLAVIYO_PREP_PACK_LIST_ID: "",
    WEB3FORMS_ACCESS_KEY: "test-key",
    ...overrides,
  };
  return { env, statements };
}

function post(path: string, body: unknown, origin = "https://www.pureihram.com") {
  return new Request(`https://pureihram-api.example${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body),
  });
}

const contact = { name: "Amina", email: "amina@example.com", subject: "Sizes", message: "Do you ship to Oslo?" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseContact", () => {
  it("trims and accepts a complete message", () => {
    expect(parseContact({ ...contact, name: "  Amina  " })).toEqual({ ok: true, value: contact });
  });

  it("keeps the Supabase function's rules", () => {
    expect(parseContact({ ...contact, message: "" })).toEqual({ ok: false, error: "All fields are required" });
    expect(parseContact({ ...contact, email: "not-an-email" })).toEqual({ ok: false, error: "Invalid email format" });
    expect(parseContact({ ...contact, name: "x".repeat(101) }).ok).toBe(false);
    expect(parseContact({ ...contact, subject: "x".repeat(201) }).ok).toBe(false);
    expect(parseContact({ ...contact, message: "x".repeat(2001) }).ok).toBe(false);
    expect(parseContact(null).ok).toBe(false);
  });
});

describe("parsePrepPack", () => {
  it("defaults locale and source", () => {
    expect(parsePrepPack({ email: "a@b.se" })).toEqual({
      ok: true,
      value: { email: "a@b.se", locale: "en", source: "homepage" },
    });
  });

  it("accepts any two-letter locale, so a new language cannot break the form", () => {
    expect(parsePrepPack({ email: "a@b.fr", locale: "fr" }).ok).toBe(true);
    expect(parsePrepPack({ email: "a@b.fr", locale: "french" }).ok).toBe(false);
  });

  it("rejects a bad email", () => {
    expect(parsePrepPack({ email: "nope" }).ok).toBe(false);
  });
});

describe("POST /contact", () => {
  it("stores the message, delivers it, then marks it delivered", async () => {
    const fetchMock = vi.fn(async () => Response.json({ success: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { env, statements } = makeEnv();

    const response = await worker.fetch(post("/contact", contact), env);

    expect(response.status).toBe(200);
    expect(statements.map((s) => s.sql.split(" ")[0])).toEqual(["INSERT", "UPDATE"]);
    expect(statements[0].args.slice(1)).toEqual(["Amina", "amina@example.com", "Sizes", "Do you ship to Oslo?"]);
    expect(fetchMock).toHaveBeenCalledWith("https://api.web3forms.com/submit", expect.anything());
  });

  it("keeps the message even when delivery fails, and tells the visitor", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    const { env, statements } = makeEnv();

    const response = await worker.fetch(post("/contact", contact), env);

    expect(response.status).toBe(500);
    expect(statements.map((s) => s.sql.split(" ")[0])).toEqual(["INSERT"]);
  });

  it("keeps the message when the delivery key is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { env, statements } = makeEnv({ WEB3FORMS_ACCESS_KEY: undefined });

    const response = await worker.fetch(post("/contact", contact), env);

    expect(response.status).toBe(500);
    expect(statements).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts Web3Forms' HTML success page", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<p>Form submitted successfully!</p>")));
    const { env } = makeEnv();

    expect((await worker.fetch(post("/contact", contact), env)).status).toBe(200);
  });
});

describe("POST /prep-pack", () => {
  it("stores the signup and sends the Klaviyo event with the public site ID only", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    const { env, statements } = makeEnv();

    const response = await worker.fetch(post("/prep-pack", { email: "a@b.se", locale: "sv" }), env);

    expect(response.status).toBe(200);
    expect(statements[0].sql).toMatch(/^INSERT OR IGNORE INTO hajj_prep_subscribers/);
    expect(statements[0].args.slice(1)).toEqual(["a@b.se", "sv", "homepage"]);

    // No list ID configured: the event goes, the list subscription is skipped.
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://a.klaviyo.com/client/events?company_id=TGazgN");
    expect(new Headers(init.headers).has("Authorization")).toBe(false);
    expect(JSON.parse(init.body as string).data.attributes.metric.data.attributes.name).toBe(
      "Requested Hajj Prep Pack"
    );
  });

  it("subscribes to the list when one is configured", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    const { env } = makeEnv({ KLAVIYO_PREP_PACK_LIST_ID: "AbC123" });

    await worker.fetch(post("/prep-pack", { email: "a@b.se" }), env);

    const [url, init] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    expect(url).toBe("https://a.klaviyo.com/client/subscriptions?company_id=TGazgN");
    expect(JSON.parse(init.body as string).data.relationships.list.data.id).toBe("AbC123");
  });

  it("still stores the signup when Klaviyo is down, but reports the failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));
    const { env, statements } = makeEnv();

    const response = await worker.fetch(post("/prep-pack", { email: "a@b.se" }), env);

    expect(response.status).toBe(502);
    expect(statements).toHaveLength(1);
  });
});

describe("CORS", () => {
  it("echoes an allowed origin and falls back to the shop for anything else", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 202 })));
    const { env } = makeEnv();

    const local = await worker.fetch(post("/prep-pack", { email: "a@b.se" }, "http://localhost:5178"), env);
    expect(local.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:5178");

    const other = await worker.fetch(post("/prep-pack", { email: "a@b.se" }, "https://evil.example"), env);
    expect(other.headers.get("Access-Control-Allow-Origin")).toBe("https://www.pureihram.com");
  });
});
