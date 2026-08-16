import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

export function initPostHog() {
  if (!POSTHOG_KEY || POSTHOG_KEY.trim() === "") {
    return;
  }

  if (initialized) {
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false,
    capture_pageleave: true,
    session_recording: {
      recordCrossOriginIframes: false,
    },
  });

  posthog.register({
    product: "coffee-connoisseur",
  });

  initialized = true;
}

export function capturePageview(pathname: string) {
  if (!initialized) {
    return;
  }

  posthog.capture("$pageview", {
    $current_url: window.location.href,
    $pathname: pathname,
  });
}

export { posthog };
