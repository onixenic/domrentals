// analyticsLoader.js
import { getFirebaseAnalytics, logEvent } from "../../src/config/firebaseConfig.js"; // adjust path

export async function loadGoogleAnalytics() {
  if (typeof window === "undefined") return;
  if (window.CookieConsent?.acceptedCategory("analytics")) {
    try {
      const analytics = getFirebaseAnalytics();
      if (analytics) {
        logEvent('page_view');
        window.firebaseAnalyticsLoaded = true;
      }
    } catch (error) {
      console.error("Failed to log analytics event:", error);
    }
  } else {
    deleteAnalyticsCookies();
  }
}

export function deleteAnalyticsCookies() {
  const cookies = ["_ga", "_gid", "_gat", "_ga_TF69DC7NKY"];
  cookies.forEach((cookie) => {
    document.cookie = cookie + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
        cookie +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
        window.location.hostname;
  });
}
