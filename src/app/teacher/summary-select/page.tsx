'use client';
import React from 'react';
import Link from 'next/link';
import { IoChevronBack, IoGridOutline, IoLayersOutline } from 'react-icons/io5';

export default function SummarySelectionMenu() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8 md:p-16 font-sans">
      {/* ヘッダー */}
      <header className="max-w-5xl mx-auto mb-20 flex items-center gap-10">
        <Link 
          href="/teacher" 
          className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-xl shadow-slate-200/50 hover:scale-105 transition-all border border-white group"
        >
          <span className="text-4xl font-black text-slate-200 group-hover:text-indigo-600 transition-colors">←</span>
        </Link>
        <div>
          <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-2">Navigation</p>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">総覧機能</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 🚀 UNIT VIEW：単元（課題箱）ごとに表示を選択 */}
        <Link href="/teacher/summary-select/unit" className="group">
          <div className="bg-white p-12 rounded-[56px] shadow-xl shadow-slate-200/50 border-4 border-transparent hover:border-purple-400 transition-all duration-500 h-[400px] flex flex-col justify-between relative overflow-hidden">
            <IoLayersOutline className="text-8xl text-purple-50 opacity-10 absolute -right-4 -top-4 group-hover:scale-110 transition-transform" />
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center mb-6">
                <IoLayersOutline className="text-3xl text-purple-600" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter mb-4">Unit View</h2>
              <p className="text-slate-400 font-bold leading-relaxed">同じ単元名の作品を<br />クラスをまたいで一覧表示します。</p>
            </div>
            <div className="flex items-center gap-2 text-purple-600 font-black uppercase tracking-widest text-sm">
              Open Unit Archive <span className="text-xl">→</span>
            </div>
          </div>
        </Link>

        {/* 🚀 GRADE VIEW：学年（クラス）ごとに表示を選択 */}
        <Link href="/teacher/summary-select/grade" className="group">
          <div className="bg-white p-12 rounded-[56px] shadow-xl shadow-slate-200/50 border-4 border-transparent hover:border-indigo-400 transition-all duration-500 h-[400px] flex flex-col justify-between relative overflow-hidden">
            <IoGridOutline className="text-8xl text-indigo-50 opacity-10 absolute -right-4 -top-4 group-hover:scale-110 transition-transform" />
            <div>
              <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6">
                <IoGridOutline className="text-3xl text-indigo-600" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter mb-4">Grade View</h2>
              <p className="text-slate-400 font-bold leading-relaxed">クラスごとの提出状況や<br />進捗をリスト形式で確認します。</p>
            </div>
            <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-sm">
              Open Grade Archive <span className="text-xl">→</span>
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}