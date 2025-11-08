import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";


export async function fetchFirebaseImage(gsPath) {
  const fileRef = ref(storage, gsPath);
  const url = await getDownloadURL(fileRef);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${gsPath}: ${res.statusText}`);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const contentType = getContentTypeFromExtension(gsPath);

  return { base64, contentType };
}


function getContentTypeFromExtension(filename) {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "avif": return "image/avif";
    case "webp": return "image/webp";
    default: return "application/octet-stream";
  }
}