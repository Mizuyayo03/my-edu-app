'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { IoSchoolOutline, IoPersonOutline } from 'react-icons/io5';

export default function RootPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6 font-sans text-slate-900">
      {/* ロゴエリア */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">
          Academic <span className="text-indigo-600">App</span>
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* 先生用入り口 */}
        <button
          onClick={() => router.push('/teacher/login')} // 🚨 ここを /teacher から /teacher/login に修正
          className="group bg-slate-900 p-10 rounded-[40px] shadow-xl hover:shadow-2xl hover:bg-indigo-700 transition-all flex flex-col items-center text-white"
        >
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <IoSchoolOutline className="text-4xl" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter uppercase">Teacher</span>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-2">教員用パネル</p>
        </button>

        {/* 生徒用入り口 */}
        <button
          onClick={() => router.push('/student')}
          className="group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-slate-100 transition-all flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-indigo-600">
            <IoPersonOutline className="text-4xl" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">Student</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">生徒用パネル</p>
        </button>
      </div>

      <footer className="mt-16">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Ready to Start</p>
      </footer>
    </div>
  );
}