'use client';
import React, { useState } from 'react';
import { auth, db } from '../../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // setDocを使用
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // updateDocではなくsetDocを使うことで、ドキュメントが存在しなくてもエラーになりません
      await setDoc(doc(db, "users", res.user.uid), {
        email: email,
        role: 'teacher',
        createdAt: new Date()
      });
      router.push('/teacher');
    } catch (err: any) { 
      alert("登録エラー: " + err.message); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[32px] shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-black mb-8 text-center text-slate-900 uppercase italic tracking-tighter">Teacher Signup</h1>
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="text-left">
            <label className="text-xs font-black text-slate-700 ml-2 uppercase tracking-widest">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-300 mt-1 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900" placeholder="1234@gmail.com" required />
          </div>
          <div className="text-left">
            <label className="text-xs font-black text-slate-700 ml-2 uppercase tracking-widest">Create Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-300 mt-1 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900" placeholder="••••••" required />
          </div>
          <button className="w-full py-5 bg-blue-700 text-white rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all uppercase italic">Sign Up</button>
        </form>
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <Link href="/teacher/login" className="text-sm text-blue-700 font-black hover:underline underline-offset-4">すでにアカウントをお持ちの方（ログインへ）</Link>
        </div>
      </div>
    </div>
  );
}