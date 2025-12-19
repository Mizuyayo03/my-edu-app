'use client'; // 🚀 Linkの動作を安定させるため client を追加
import React from 'react';
import Link from 'next/link';
import { IoArrowBack, IoPeopleOutline, IoDocumentTextOutline } from 'react-icons/io5';

export default function StudentShareSelectPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <header className="max-w-2xl mx-auto mb-10">
        {/* 🚀 戻り先を /student に変更 */}
        <Link href="/student" className="flex items-center text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity mb-4">
          <IoArrowBack className="w-3 h-3 mr-1" /> Back to Panel
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase mb-1">Collaboration</span>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">Share</h1>
          <p className="text-xs font-bold text-indigo-400 mt-1 uppercase italic tracking-tighter">Connect with others</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        {/* 他の生徒の作品を見る */}
        <Link 
          href="/student/gallery" // 🚀 すでに作ったギャラリーへ繋げるのがスムーズです
          className="group block p-8 bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all border-4 border-white hover:border-indigo-50"
        >
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <IoPeopleOutline className="w-8 h-8 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Student Gallery</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">クラスメイトの作品を見て、感性を磨こう。</p>
            </div>
          </div>
        </Link>

        {/* 共有された資料を見る */}
        <Link 
          href="/student/share/materials" 
          className="group block p-8 bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all border-4 border-white hover:border-emerald-50"
        >
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <IoDocumentTextOutline className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Materials</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">先生から共有された授業資料をチェック。</p>
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}