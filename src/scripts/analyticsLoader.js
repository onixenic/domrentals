// analyticsLoader.js
import { getFirebaseAnalytics, logEvent, getMeasurementId } from "../config/firebaseConfig.js"; // adjust path


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

  const cookies = ["_ga", "_gid", "_gat"];
  const measurementId = getMeasurementId();

  if (measurementId) cookies.push(`_ga_${measurementId.replace("G-", "")}`);
  cookies.forEach((cookie) => {
    document.cookie = cookie + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
        cookie +
        "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" +
        window.location.hostname;
  });
}
