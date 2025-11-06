import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app;
let db;

/**
 * Initialize Firebase Admin SDK
 * Only call this function at runtime (in API routes, not during build)
 */
export function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    app = getApps()[0];
    if (!db) {
      db = getFirestore(process.env.FIREBASE_FIREBASE_DBNAME);
    }
    return db;
  }

  // Ensure credentials are available
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
  }

  try {
    // Parse and initialize
    const credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
    app = initializeApp({
      credential: credential,
      databaseURL: process.env.FIREBASE_FIREBASE_DB,
    });

    // Initialize Firestore
    db = getFirestore(process.env.FIREBASE_FIREBASE_DBNAME);

    return db;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw error;
  }
}

/**
 * Get Firestore instance
 * Will initialize if not already done
 */
export function getDb() {
  if (!db) {
    initializeFirebaseAdmin();
  }
  return db;
}