'use client';

import React, { useState } from 'react';
import { auth, db } from '../../../firebase/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';

export default function StudentLoginPage() {
  const router = useRouter();
  
  // 入力フォームの状態管理
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 💡 Firestoreの'users'コレクションに登録があるかチェック
   */
  const checkUserRegistration = async (userEmail: string) => {
    const cleanEmail = userEmail.toLowerCase().trim();
    const q = query(collection(db, "users"), where("email", "==", cleanEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      console.log("Firestore登録確認成功:", cleanEmail);
      router.push('/student');
    } else {
      // Authには存在するがFirestoreに名簿がない場合
      await signOut(auth);
      alert(`Firestoreの名簿（users）に登録がありません:\n${cleanEmail}\n\n名簿ドキュメントを作成してください。`);
    }
  };

  // --- 1. Googleログイン（本番用） ---
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email) {
        await checkUserRegistration(result.user.email);
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        alert("Googleログインに失敗しました。");
      }
    }
  };

  // --- 2. メールアドレスとパスワードでログイン ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;

    setIsLoading(true);
    try {
      // 🚀 入力されたメアドとパスワードで認証
      await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      
      // 成功したらFirestore側の名簿チェック
      await checkUserRegistration(emailInput);
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        alert("メールアドレスまたはパスワードが正しくありません。");
      } else {
        alert("ログイン中にエラーが発生しました。");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-xl w-full max-w-md border-t-8 border-indigo-600 text-center">
        <h1 className="text-2xl font-black mb-2 text-indigo-900 italic uppercase tracking-tighter">生徒用ログイン</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10">Art Education System</p>
        
        {/* Googleログインボタン */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full py-5 bg-white text-slate-700 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 border-2 border-slate-50 active:scale-95 transition-all flex items-center justify-center gap-4 mb-8"
        >
          <FcGoogle className="text-3xl" />
          Googleでログイン
        </button>

        <div className="relative mb-8">
          <hr className="border-indigo-100" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest">or</span>
        </div>
        
        {/* メール・パスワード入力フォーム */}
        <form onSubmit={handleEmailLogin} className="space-y-4 text-left">
          <div>
            <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest ml-2 mb-1 block">Email</label>
            <div className="relative">
              <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
              <input 
                type="email" 
                placeholder="test01@example.com" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-indigo-50/50 border-2 border-transparent focus:border-indigo-200 rounded-[18px] py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-indigo-900 uppercase tracking-widest ml-2 mb-1 block">Password</label>
            <div className="relative">
              <IoLockClosedOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={20} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-indigo-50/50 border-2 border-transparent focus:border-indigo-200 rounded-[18px] py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none transition-all"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-5 mt-4 bg-indigo-900 text-white rounded-[18px] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 active:scale-95 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-8 p-6 bg-slate-50 rounded-[30px] border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
            Authentication ＆ Firestore <br/>の両方に登録が必要です
          </p>
        </div>
      </div>
    </div>
  );
}