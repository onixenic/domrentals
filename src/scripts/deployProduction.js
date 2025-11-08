import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { getStorageInstance } from "../config/firebaseAdminConfig.js";
import AdmZip from "adm-zip";
import dotenv from "dotenv";

// --- Project paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..", "..");
const pagesDir = path.join(projectRoot, "src/pages");
const distDir = path.join(projectRoot, "dist");
const tempDistDir = path.join(projectRoot, ".temp_dist");

dotenv.config({ path: path.join(projectRoot, ".env") });

// --- Pages to rebuild
const pages = ["showcase_bb"]; // [] → build all pages
const buildAll = pages.length === 0;
console.log(buildAll ? "🚀 Building all pages" : "🚀 Incremental build pages: " + pages.join(","));

// --- 1️⃣ Prepare temp folder
await fs.emptyDir(tempDistDir);

// --- 2️⃣ Download latest dist ZIP from Firebase
const storage = getStorageInstance();
const bucket = storage.bucket();
const bucketPath = "admin/dist_production";

const [files] = await bucket.getFiles({ prefix: bucketPath + "/" });
const zipFiles = files.filter(f => f.metadata.size && parseInt(f.metadata.size) > 0);

let latestExtractPath = null;

if (zipFiles.length) {
  zipFiles.sort((a, b) => b.metadata.timeCreated.localeCompare(a.metadata.timeCreated));
  const latestFile = zipFiles[0];
  console.log("📦 Latest dist ZIP:", latestFile.name, latestFile.metadata.timeCreated);

  const originalZipName = path.basename(latestFile.name);
  const tempZipPath = path.join(tempDistDir, originalZipName);
  await latestFile.download({ destination: tempZipPath });
  console.log("✅ Downloaded latest dist ZIP to", tempZipPath);

  // Extract into its own folder inside tempDistDir
  latestExtractPath = path.join(tempDistDir, path.basename(originalZipName, ".zip"));
  await fs.ensureDir(latestExtractPath);

  const zip = new AdmZip(tempZipPath);
  zip.extractAllTo(latestExtractPath, true);
  console.log("✅ Extracted ZIP to temp folder:", latestExtractPath);
} else {
  console.log("⚠️ No previous dist ZIP found in Firebase at", bucketPath);
}

// --- 3️⃣ Rename pages not included for incremental build
let renamedPages = [];
if (!buildAll) {
  const allPages = (await fs.readdir(pagesDir)).filter(f => f.toLowerCase() !== "api");
  for (const file of allPages) {
    const baseName = path.parse(file).name.toLowerCase();
    if (!pages.includes(baseName) && !file.startsWith("_")) {
      const oldPath = path.join(pagesDir, file);
      const newPath = path.join(pagesDir, "_" + file);
      await fs.move(oldPath, newPath);
      renamedPages.push({ oldPath, newPath });
    }
  }
}

// --- 4️⃣ Run Astro build
execSync(`npm run build`, { stdio: "inherit" });

// --- 5️⃣ Merge previous dist (if exists) into new dist
if (latestExtractPath) {
  await fs.copy(latestExtractPath, distDir, { overwrite: false });
  console.log("✅ Merged previous dist into new dist");
}

// --- 6️⃣ Restore renamed pages
for (const { oldPath, newPath } of renamedPages) {
  await fs.move(newPath, oldPath);
}

// --- 7️⃣ Create new ZIP from dist
const now = new Date();
const pad = (n) => n.toString().padStart(2, "0");
const dateTime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
const newZipName = `dist_${dateTime}.zip`;

const newZipPath = path.join(tempDistDir, newZipName);
const zip = new AdmZip();
zip.addLocalFolder(distDir);
zip.writeZip(newZipPath);
console.log("📦 Created new dist ZIP:", newZipPath);

// --- 8️⃣ Upload new ZIP to Firebase
await bucket.upload(newZipPath, {
  destination: `${bucketPath}/${newZipName}`
});
console.log("✅ Uploaded new dist ZIP to Firebase:", `${bucketPath}/${newZipName}`);

console.log("✅ Done! Build complete and dist uploaded.");
