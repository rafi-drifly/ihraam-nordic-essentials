-- Wrong admin passwords (16 Nov 2026, when the admin moved from Cloudflare
-- Access to a password: workers/api/src/admin-session.ts). Five from one
-- address within 15 minutes lock that address out until they age out. Rows
-- older than a day are deleted whenever someone signs in.
CREATE TABLE IF NOT EXISTS admin_login_failures (
  ip TEXT NOT NULL,
  failed_at INTEGER NOT NULL -- milliseconds since 1970
);

CREATE INDEX IF NOT EXISTS admin_login_failures_ip_time ON admin_login_failures (ip, failed_at);
