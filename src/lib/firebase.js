import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAkQ0tAqvLogBkzLN8n4Jvgk33DDeM-DaI",
    authDomain: "sdp-v2-553c0.firebaseapp.com",
    projectId: "sdp-v2-553c0",
    storageBucket: "sdp-v2-553c0.firebasestorage.app",
    messagingSenderId: "301642545533",
    appId: "1:301642545533:web:27c7524787f14aef533414",
    measurementId: "G-RFF97QM7B7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
