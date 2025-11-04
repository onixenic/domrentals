import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc
} from 'firebase/firestore';
import { database } from '../../firebase.json';
import { firebaseConfig } from "../config/firebaseConfig.js";
import { initializeApp } from "firebase/app";


const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export function uploadPhoto(file, propertyId, onProgress) {
  const storageRef = ref(storage, `properties/${propertyId}/${file.name}`);
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
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => resolve(downloadURL));
        }
    );
  });
}


export const getNextPropertyId = async () => {
  const counterRef = doc(db, 'counters', 'properties');
  const snapshot = await getDoc(counterRef);

  if (!snapshot.exists()) {
    await setDoc(counterRef, { value: 1 });
    return 1;
  }

  const newValue = snapshot.data().value + 1;
  await updateDoc(counterRef, { value: newValue });
  return newValue;
};