import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

export async function addFavorite(uid, emailId) {
  const ref = doc(db, 'users', uid, 'favorites', emailId);
  await setDoc(ref, { addedAt: new Date() });
}

export async function removeFavorite(uid, emailId) {
  const ref = doc(db, 'users', uid, 'favorites', emailId);
  await deleteDoc(ref);
}

export async function getFavorites(uid) {
  const ref = collection(db, 'users', uid, 'favorites');
  const snap = await getDocs(ref);
  return snap.docs.map(doc => doc.id);
} 