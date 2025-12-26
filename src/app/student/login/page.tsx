'use client';

import React from 'react';
import { auth, db } from '../../../firebase/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore'; // getDocsを使う
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';

export default function StudentLoginPage() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      // 1. Googleログイン画面を表示
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        throw new Error("メールアドレスが取得できませんでした。");
      }

      // 2. 🚀 重要：IDで探すのではなく、emailフィールドが一致するドキュメントを検索
      // これにより、複数クラスに登録されていてもログインできるようになります
      const q = query(collection(db, "users"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // ✅ 登録リスト（usersコレクション）に1件でも一致があれば成功
        console.log("ログイン成功、所属クラス数:", querySnapshot.size);
        router.push('/student');
      } else {
        // ❌ どこにも登録されていない場合
        await signOut(auth);
        alert("先生の登録リストにあなたのメールアドレスが見つかりません。");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      if (err.code === 'auth/network-request-failed') {
        alert("ネットワークエラーが発生しました。");
      } else if (err.code !== 'auth/popup-closed-by-user') {
        alert("ログインに失敗しました。もう一度試してください。");
      }
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-xl w-full max-w-md border-t-8 border-indigo-600 text-center">
        <h1 className="text-2xl font-black mb-2 text-indigo-900 italic uppercase tracking-tighter">生徒用ログイン画面</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-12">許可されたアカウント専用</p>
        
        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white text-slate-700 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 border-2 border-slate-50 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            <FcGoogle className="text-3xl" />
            Googleでログイン
          </button>
        </div>

        <div className="mt-12 p-6 bg-indigo-50/50 rounded-[30px] border border-indigo-100">
          <p className="text-[11px] font-bold text-indigo-900 leading-relaxed">
            学校から配布された<br/>
            Googleアカウントを使用してください。<br/>
            先生が登録したアドレスのみログイン可能です。
          </p>
        </div>
      </div>
    </div>
  );
}