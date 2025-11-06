import dotenv from 'dotenv';
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY))
  });
} else {
  app = getApps()[0];
}

export const db = getFirestore(process.env.FIREBASE_FIREBASE_DBNAME);