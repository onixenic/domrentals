import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebaseConfig.js";

// Generate a short alphanumeric ID
function generateShortId(length = 4) {
  return crypto.getRandomValues(new Uint8Array(length))
      .reduce((str, byte) => str + byte.toString(36), '');
}

export function uploadFilesToPropertyBucket(file, propertyId, onProgress, existingFolderName) {
  let folderName;

  if (existingFolderName) {
    folderName = existingFolderName; // reuse existing folder
  } else {
    const now = new Date();
    const dateTimeString = now.toISOString()
        .split('T')
        .map((part, i) => i === 1 ? part.split('.')[0].replace(/:/g, '-') : part)
        .join('_');
    const shortId = generateShortId(6);
    folderName = `${dateTimeString}_${shortId}`;
  }

  const storageRef = ref(storage, `properties/${propertyId}/file-upload/${folderName}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
        "state_changed",
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        },
        (error) => reject(error),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
              resolve({ url: downloadURL, folderName })
          );
        }
    );
  });
}
