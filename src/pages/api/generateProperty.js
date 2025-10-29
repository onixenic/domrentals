// src/pages/api/generatePropertyId.js
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
    projectId: "YOUR_PROJECT_ID",
    keyFilename: "./path/to/service-account.json",
});

const bucketName = "your-bucket-name";
const bucket = storage.bucket(bucketName);

function generateRandomId(length = 4) {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let id = "";
    for (let i = 0; i < length; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
}

function generateRandomPassword(length = 6) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let psw = "";
    for (let i = 0; i < length; i++) {
        psw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return psw;
}

async function generateUniqueId() {
    let id;
    let exists = true;

    while (exists) {
        id = generateRandomId();
        const file = bucket.file(id);
        const [fileExists] = await file.exists();
        exists = fileExists;
    }

    return id;
}

export async function get() {
    // const propertyId = await generateUniqueId();
    // const propertyPsw = generateRandomPassword();

    const propertyId = "Test";
    const propertyPsw = "Test";

    return {
        body: JSON.stringify({ propertyId, propertyPsw }),
        status: 200,
        headers: { "Content-Type": "application/json" },
    };
}
