import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAq7CujQi0aJURqvD9np55BMdmJT9qHe4c",
  authDomain: "edutest-pro-84730.firebaseapp.com",
  projectId: "edutest-pro-84730",
  storageBucket: "edutest-pro-84730.firebasestorage.app",
  messagingSenderId: "601198561685",
  appId: "1:601198561685:web:d91a8c255e22e1f78e8e9c",
  measurementId: "G-Z0S3NDVYYF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
