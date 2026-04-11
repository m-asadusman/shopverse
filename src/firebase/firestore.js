import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from './config';

// ─── Products ──────────────────────────────────────────────────────────────

export const fetchProducts = async () => {
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addProduct = async (data) => {
  const ref = await addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProduct = async (id, data) => {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, 'products', id));
};

// ─── Users ─────────────────────────────────────────────────────────────────

export const createUserDoc = async ({ uid, email, displayName }) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      displayName: displayName || '',
      role: 'user',
      createdAt: serverTimestamp(),
    });
  }
};

export const getUserRole = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data().role || null;
};

// ─── Orders ────────────────────────────────────────────────────────────────

export const saveOrder = async (uid, orderData) => {
  await addDoc(collection(db, 'orders'), {
    uid,
    ...orderData,
    createdAt: serverTimestamp(),
  });
};

export const fetchUserOrders = async (uid) => {
  // No orderBy here — avoids needing a Firestore composite index.
  // We filter by uid client-side and sort by createdAt manually.
  const snap = await getDocs(collection(db, 'orders'));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(o => o.uid === uid)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime; // newest first
    });
};
