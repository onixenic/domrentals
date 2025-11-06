// src/pages/api/generatePropertyId.js
import {getDb} from "./firebaseAdminConfig.js";


export function generateSecurePassword(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_-+=';
    const charsetLength = charset.length;
    const randomValues = new Uint8Array(length);

    crypto.getRandomValues(randomValues);

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset[randomValues[i] % charsetLength];
    }

    return password;
}

export async function GET() {
    try {

        const db = getDb();
        const counterRef = db.collection("counters").doc("properties");
        const snapshot = await counterRef.get();
        let newValue = 1;
        if (snapshot.exists) {
            newValue = snapshot.data().value + 1;
            await counterRef.update({ value: newValue });
        } else {
            await counterRef.set({ value: newValue });
        }

        return new Response(
            JSON.stringify({ propertyId: newValue, password: generateSecurePassword() }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        console.error("Error generating next property ID:", err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
