import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // 🚀 追加

// 【重要】ここをあなたのFirebaseコンソールの設定値に書き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyBG19dAXBUGPxFe_LH3EiKV1tvdmJwBAK8",
  authDomain: "colorversemvp.firebaseapp.com",
  projectId: "colorversemvp",
  storageBucket: "colorversemvp.firebasestorage.app", // ここがStorageの場所です
  messagingSenderId: "203836390424",
  appId: "1:203836390424:web:71ebd169591a0449cc176d"
};

// 二重に初期化されないようにチェック
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// 各機能を使えるようにして書き出し
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // 🚀 追加