'use client';
import React, { useState } from 'react';
import { auth } from '../../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/student');
    } catch (err) {
      alert("ログインに失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-10 rounded-[40px] shadow-xl w-full max-w-md border-t-8 border-indigo-600">
        <h1 className="text-2xl font-black mb-8 text-center text-indigo-900 italic uppercase tracking-tighter">Student Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-700 ml-2 uppercase tracking-[0.2em]">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-200 mt-1 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-900 placeholder:text-slate-300" 
              placeholder="student@example.com" 
              required 
            />
          </div>
          <div className="text-left">
            <label className="text-[10px] font-black text-slate-700 ml-2 uppercase tracking-[0.2em]">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 bg-indigo-50/30 rounded-2xl border border-indigo-200 mt-1 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-slate-900 placeholder:text-slate-300" 
              placeholder="••••••"
              required 
            />
          </div>
          <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-200 active:scale-95 transition-all uppercase italic">
            Login
          </button>
        </form>
        <div className="mt-8 text-center pt-4">
          <Link href="/student/signup" className="text-sm text-indigo-600 font-black uppercase tracking-tighter hover:text-indigo-800 transition-colors underline underline-offset-8 decoration-indigo-200">
            Don't have an account? (Sign Up)
          </Link>
        </div>
      </div>
    </div>
  );
}