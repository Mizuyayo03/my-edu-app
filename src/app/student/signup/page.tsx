'use client';
import React, { useState } from 'react';
import { auth, db } from '../../../firebase/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentSignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // ここで確実にドキュメントを作成
      await setDoc(doc(db, "users", res.user.uid), {
        email: email,
        role: 'student',
        classCode: null, 
        createdAt: new Date()
      });
      router.push('/student');
    } catch (err: any) { 
      alert("登録エラー: " + err.message); 
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-xl w-full max-w-md border-t-8 border-indigo-600">
        <h1 className="text-2xl font-black mb-8 text-center text-indigo-900 italic uppercase tracking-tighter">Student Signup</h1>
        <form onSubmit={handleSignup} className="space-y-6">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-700 ml-2 uppercase tracking-[0.2em]">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-200 mt-1 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-900" placeholder="student@example.com" required />
          </div>
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-700 ml-2 uppercase tracking-[0.2em]">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-200 mt-1 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-900" placeholder="••••••" required />
          </div>
          <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-all uppercase italic">Sign Up</button>
        </form>
        <div className="mt-8 text-center pt-4">
          <Link href="/student/login" className="text-sm text-indigo-600 font-black uppercase tracking-tighter hover:text-indigo-800 transition-colors underline underline-offset-8 decoration-indigo-200">すでにアカウントをお持ちの方（ログインへ）</Link>
        </div>
      </div>
    </div>
  );
}