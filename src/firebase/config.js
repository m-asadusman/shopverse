import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBF8rjVniwaIWyKLgbh10_Arn9xpq3Vk5M",
  authDomain: "ecommerce-f7307.firebaseapp.com",
  projectId: "ecommerce-f7307",
  storageBucket: "ecommerce-f7307.firebasestorage.app",
  messagingSenderId: "143836112480",
  appId: "1:143836112480:web:c8c905198a43b4c9884505"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
