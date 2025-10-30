export type AnalyticsEvent = {
  event: string;
  payload?: Record<string, unknown>;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const trackEvent = ({ event, payload = {} }: AnalyticsEvent) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...payload, timestamp: Date.now() });
  window.dispatchEvent(
    new CustomEvent("analytics:event", { detail: { event, payload } }),
  );
};
