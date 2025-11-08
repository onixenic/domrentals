import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import dotenv from "dotenv";

dotenv.config();

let app;
let db;
let storage;

/**
 * Initialize Firebase Admin SDK
 * Only call this function at runtime (in API routes, not during build)
 */
export function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    app = getApps()[0];
    if (!db) {
      db = getFirestore(process.env.PRIVATE_FIREBASE_DBNAME);
    }
    if (!storage) {
      storage = getStorage();
    }
    return { db, storage };
  }

  if (!process.env.PRIVATE_SERVICE_ACCOUNT_KEY) {
    throw new Error(
        "PRIVATE_SERVICE_ACCOUNT_KEY environment variable is not set"
    );
  }

  if (!process.env.PUBLIC_FIREBASE_STORAGE_BUCKET) {
    throw new Error(
        "PUBLIC_FIREBASE_STORAGE_BUCKET environment variable is not set"
    );
  }



  try {
    const credential = cert(
        JSON.parse(process.env.PRIVATE_SERVICE_ACCOUNT_KEY)
    );
    app = initializeApp({
      credential,
      databaseURL: process.env.PRIVATE_FIREBASE_DB,
      storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
    });

    db = getFirestore(process.env.PRIVATE_FIREBASE_DBNAME);
    storage = getStorage(app);

    return { db, storage };
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw error;
  }
}

/**
 * Get Firestore instance
 */
export function getDb() {
  if (!db) {
    initializeFirebaseAdmin();
  }
  return db;
}

/**
 * Get Storage instance
 */
export function getStorageInstance() {
  if (!storage) {
    const admin = initializeFirebaseAdmin();
    storage = admin.storage;
  }
  return storage;
}