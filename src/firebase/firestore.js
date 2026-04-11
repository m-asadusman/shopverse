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

const COL = 'products';

// ─── Products ──────────────────────────────────────────────────────────────

export const fetchProducts = async () => {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addProduct = async (data) => {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProduct = async (id, data) => {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, COL, id));
};

// ─── Users ─────────────────────────────────────────────────────────────────

// Creates the user doc in Firestore if it doesn't exist yet (safe to call on every login)
export const createUserDoc = async ({ uid, email, displayName }) => {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      displayName: displayName || '',
      role: 'user',           // default role — change to 'admin' manually in Firestore console
      createdAt: serverTimestamp(),
    });
  }
};

// Returns the user's role string ('admin' | 'user' | null)
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
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(o => o.uid === uid);
};

// ─── Reviews ───────────────────────────────────────────────────────────────

export const fetchProductReviews = async (productId) => {
  const q = query(
    collection(db, 'reviews'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(r => r.productId === productId);
};

export const submitReview = async ({ productId, uid, displayName, rating, comment }) => {
  // Save the review
  await addDoc(collection(db, 'reviews'), {
    productId,
    uid,
    displayName,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });

  // Recalculate product rating + review count
  const allReviews = await fetchProductReviews(productId);
  const newCount = allReviews.length;
  const newRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount;

  await updateDoc(doc(db, 'products', productId), {
    rating: Math.round(newRating * 10) / 10,
    reviews: newCount,
  });
};

export const hasUserReviewedProduct = async (uid, productId) => {
  const reviews = await fetchProductReviews(productId);
  return reviews.some(r => r.uid === uid);
};

export const hasUserPurchasedProduct = async (uid, productId) => {
  const orders = await fetchUserOrders(uid);
  return orders.some(order =>
    order.items?.some(item => String(item.id) === String(productId))
  );
};
