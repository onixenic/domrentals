import { initializeApp, getApp } from "firebase/app";
import { getAnalytics, logEvent as fbLogEvent } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app;
try {
  app = getApp();
} catch (error) {
  app = initializeApp(firebaseConfig);
}

// Analytics lazy initialization
let analyticsInstance;
export function getFirebaseAnalytics() {
  if (typeof window === "undefined") return null; // SSR safe
  if (!analyticsInstance) {
    analyticsInstance = getAnalytics(app);
  }
  return analyticsInstance;
}
export function logEvent(eventName, eventParams) {
  const analytics = getFirebaseAnalytics();
  if (!analytics) return;
  fbLogEvent(analytics, eventName, eventParams);
}

export const storage = getStorage(app);
export const db = getFirestore(app);
export { app };