'use client';

import React, { useState } from 'react';
import { auth, db } from '../../../firebase/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { IoMailOutline } from 'react-icons/io5';

export default function StudentLoginPage() {
  const router = useRouter();
  
  // テスト用ログインの状態管理
  const [email, setEmail] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);

  /**
   * 💡 重要：ユーザーがFirestoreの登録リスト（users）に存在するか、
   * かつ「生徒(role: student)」であるかを厳格にチェックする関数
   */
  const checkUserRegistration = async (userEmail: string) => {
    const q = query(collection(db, "users"), where("email", "==", userEmail.toLowerCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      
      // セキュリティ：roleがstudentの場合のみログインを許可
      if (userData.role === "student") {
        console.log("生徒としてログイン成功。所属クラスID:", userData.classId);
        
        // ログイン情報を保持（他のページでDBを引く際に使用）
        sessionStorage.setItem('active_student_email', userEmail.toLowerCase());
        
        // ダッシュボードへ遷移
        router.push('/student');
      } else {
        // 先生アカウントなどの場合は生徒画面には入れない
        await signOut(auth);
        alert("このログイン方法は生徒専用です。先生は先生用画面からログインしてください。");
      }
    } else {
      // どこにも登録がない場合
      await signOut(auth);
      alert("登録リストにこのメールアドレスが見つかりません。\n先生の画面でCSVインポートが完了しているか確認してください。");
    }
  };

  // --- 1. Googleログイン（本番用イメージ） ---
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
        alert("ログインに失敗しました。");
      }
    }
  };

  // --- 2. 🚀 テスト用：パスワードなしメールログイン ---
  const handleEasyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsTestLoading(true);
    try {
      // 匿名認証（Anonymous）を使用してFirebase Authの認証壁を突破
      await signInAnonymously(auth);
      // その後、Firestoreの登録状況をチェック
      await checkUserRegistration(email);
    } catch (err: any) {
      console.error("Test Login Error:", err);
      alert("ログインエラーが発生しました。匿名認証が有効か確認してください。");
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-xl w-full max-w-md border-t-8 border-indigo-600 text-center">
        <h1 className="text-2xl font-black mb-2 text-indigo-900 italic uppercase tracking-tighter">生徒用ログイン画面</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-12">許可されたアカウント専用</p>
        
        {/* 本番運用を想定したGoogleログインボタン */}
        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white text-slate-700 rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 border-2 border-slate-50 active:scale-95 transition-all flex items-center justify-center gap-4"
          >
            <FcGoogle className="text-3xl" />
            Googleでログイン
          </button>
        </div>

        {/* --- 🚀 テストプレイ専用セクション（パスワードなし） --- */}
        <div className="mt-10 pt-10 border-t-2 border-dashed border-indigo-100 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest">
            Test Play Only
          </span>
          
          <p className="text-[10px] font-bold text-indigo-400 mb-4 tracking-tighter">※テスト時はメアド入力だけで入れます</p>
          
          <form onSubmit={handleEasyLogin} className="space-y-3">
            <div className="relative">
              <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
              <input 
                type="email" 
                placeholder="登録済みのメールアドレス" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                /* 💡 入力文字をはっきりした黒(text-slate-900)に設定 */
                className="w-full bg-indigo-50/50 border-none rounded-[18px] py-4 pl-12 pr-4 text-sm font-bold text-slate-900 placeholder-indigo-200 focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                required
              />
            </div>
            
            <button 
              type="submit"
              disabled={isTestLoading}
              className="w-full py-4 bg-indigo-900 text-white rounded-[18px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 active:scale-95 transition-all shadow-lg disabled:opacity-50"
            >
              {isTestLoading ? "確認中..." : "パスワードなしでログイン"}
            </button>
          </form>
        </div>

        <div className="mt-10 p-6 bg-indigo-50/50 rounded-[30px] border border-indigo-100">
          <p className="text-[11px] font-bold text-indigo-900 leading-relaxed">
            本番はGoogleアカウントを使用しますが、<br/>
            テスト時は先生がインポートした<br/>
            メールアドレスだけでログイン可能です。
          </p>
        </div>
      </div>
    </div>
  );
}