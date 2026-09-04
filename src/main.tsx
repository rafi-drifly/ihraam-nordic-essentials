import "./i18n/config";
import { createRoot } from "react-dom/client";
import { PostHogProvider } from '@posthog/react';
import App from "./App.tsx";
import { isAnalyticsEnabled } from "@/lib/analytics";
import { registerServiceWorker } from "@/lib/push";
import "./index.css";

// Registered only in built output. In dev the worker would sit in front of
// Vite's module graph and serve the offline page over a restarting server,
// which looks exactly like a broken app.
if (import.meta.env.PROD) {
  window.addEventListener("load", () => {
    void registerServiceWorker();
  });
}

const posthogOptions = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
};

// The provider is mounted only on the live storefront. Guarding the tracking
// helpers is not enough on its own: PostHog is configured with autocapture and
// automatic pageviews, so merely initialising it off-domain would send clicks
// and pageviews from every local dev session into the production project.
const root = createRoot(document.getElementById("root")!);

root.render(
  isAnalyticsEnabled() ? (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN}
      options={posthogOptions}
    >
      <App />
    </PostHogProvider>
  ) : (
    <App />
  )
);
