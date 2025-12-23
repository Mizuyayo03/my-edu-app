'use client';

import React from 'react';
import { auth, db } from '../../../firebase/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';

export default function StudentLoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      // 1. Googleログイン画面をポップアップで表示
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error("メールアドレスが取得できませんでした。");
      }

      // 2. Firestoreの「users」コレクションに先生が登録したデータがあるか確認
      // 先生側の画面で doc(db, "users", email) と保存するようにしたので、emailで検索します
      const userRef = doc(db, "users", user.email);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // ✅ 許可リストに存在する場合
        console.log("ログイン成功:", userSnap.data());
        router.push('/student');
      } else {
        // ❌ 許可リストに存在しない場合
        await signOut(auth); // Authだけログイン状態になるのを防ぐ
        alert("あなたのメールアドレスは先生の許可リストに登録されていません。");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/network-request-failed') {
        alert("ネットワークエラーが発生しました。Wi-Fi環境を確認してください。");
      } else {
        alert("ログインに失敗しました。");
      }
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-xl w-full max-w-md border-t-8 border-indigo-600 text-center">
        <h1 className="text-2xl font-black mb-2 text-indigo-900 italic uppercase tracking-tighter">Student Login</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-12">Authorized Account Only</p>
        
        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white text-slate-700 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 border-2 border-slate-50 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            <FcGoogle className="text-3xl" />
            Sign in with Google
          </button>
        </div>

        <div className="mt-12 p-6 bg-indigo-50/50 rounded-[30px] border border-indigo-100">
          <p className="text-[11px] font-bold text-indigo-900 leading-relaxed">
            学校から配布された<br/>
            Googleアカウントを使用してください。<br/>
            先生が登録したアドレスのみログイン可能です。
          </p>
        </div>

        <div className="mt-8 text-center pt-4 opacity-30 pointer-events-none">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Academic App Security
          </p>
        </div>
      </div>
    </div>
  );
}