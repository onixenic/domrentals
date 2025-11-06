// src/pages/api/updateFirestore.js
import { getDb } from "./firebaseAdminConfig.js";
export const prerender = false;

export async function POST({ request }) {
  try {
    const db = getDb();
    const {
      propertyId,
      password,
      hostType,
      companyRep,
      individualName,
      phone,
      imgUploaded = false,
      jsonUploaded = false,
      isUpdate = false,
    } = await request.json();

    // Validate required fields
    if (!propertyId) {
      return new Response(
          JSON.stringify({ error: 'propertyId is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hostName = hostType === 'company' ? companyRep : individualName;

    const propertyData = {
      id_property: propertyId,
      password: password,
      host_name: hostName,
      phone: phone,
      img_uploaded: imgUploaded,
      json_uploaded: jsonUploaded,
      updated_at: new Date().toISOString()
    };

    if (isUpdate) {
      // Update existing document when form is submitted
      await db.collection('properties').doc(propertyId).update(propertyData);
      return new Response(
          JSON.stringify({
            success: true,
            message: 'Property configuration updated successfully',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      // Create new document on initial submission
      await db.collection('properties').doc(propertyId).set({
        ...propertyData,
        creation_date: new Date().toISOString(),
      });
      return new Response(
          JSON.stringify({
            success: true,
            message: 'Property created successfully',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Firestore error:', error);
    return new Response(
        JSON.stringify({
          error: 'Failed to update Firestore',
          details: error.message,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}