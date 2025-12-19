'use client';
import React, { useState } from 'react';
import { auth } from '../../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/teacher');
    } catch (err) {
      alert("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[32px] shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-black mb-8 text-center text-slate-900 uppercase italic tracking-tighter">Teacher Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-left">
            <label className="text-xs font-black text-slate-700 ml-2 uppercase tracking-widest">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-300 mt-1 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 placeholder:text-slate-300" 
              placeholder="1234@gmail.com" 
              required 
            />
          </div>
          <div className="text-left">
            <label className="text-xs font-black text-slate-700 ml-2 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-300 mt-1 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 placeholder:text-slate-300" 
              placeholder="••••••" 
              required 
            />
          </div>
          <button className="w-full py-5 bg-blue-700 text-white rounded-xl font-black text-lg shadow-lg active:scale-95 transition-all uppercase italic">
            Login
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <Link href="/teacher/signup" className="text-sm text-blue-700 font-black hover:underline underline-offset-4">
            アカウントをお持ちでない方（新規登録へ）
          </Link>
        </div>
      </div>
    </div>
  );
}