'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../../../../firebase/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { 
  IoPlay, IoPause, IoPlayBack, IoPlayForward, 
  IoChevronBack, IoChatbubbleEllipsesOutline 
} from 'react-icons/io5';

interface WorkData {
  id: string;
  images?: string[];
  imageUrl?: string; 
  studentName: string;
  unitName?: string;
  taskName?: string;
  reflection?: string;
  comment?: string;
  brightness?: number; // 型エラー回避
  createdAt?: Timestamp;
}

function StudentPortfolioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitParam = searchParams.get('unit'); 
  const studentParam = searchParams.get('student'); 
  
  const [works, setWorks] = useState<WorkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    async function fetchWorks() {
      if (!studentParam) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, "works"),
          where("studentName", "==", studentParam),
          orderBy("createdAt", "asc")
        );
        
        const snap = await getDocs(q);
        const allDocs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as WorkData[];

        // フィルタリング
        let filtered = allDocs.filter(doc => 
          doc.unitName === unitParam || doc.taskName === unitParam
        );

        if (filtered.length === 0) {
          filtered = allDocs.filter(doc => !doc.unitName || doc.unitName === "undefined");
        }

        setWorks(filtered);
      } catch (error) {
        console.error("Firestore Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchWorks();
  }, [unitParam, studentParam]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && works.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % works.length);
      }, 3000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, works.length]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-400">LOADING...</div>;

  if (works.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-slate-50">
      <p className="font-black text-slate-400 italic mb-4 uppercase text-2xl">No works found</p>
      <button onClick={() => router.back()} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold shadow-sm">Back</button>
    </div>
  );

  const currentWork = works[currentIndex];
  const studentComment = currentWork.reflection || currentWork.comment || "（コメントなし）";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      {/* ヘッダー：他の画面と合わせた白背景・シャドウ */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all">
            <IoChevronBack size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase mb-0.5 tracking-widest leading-none italic">Unit</p>
            <p className="font-black text-lg text-slate-900 truncate leading-none uppercase italic">{unitParam}</p>
          </div>
        </div>
        <div className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] font-black text-indigo-400 mb-1 leading-none uppercase tracking-widest italic">Student</p>
          <p className="font-black text-slate-900 italic uppercase">{studentParam}</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左側：プレイヤー */}
        <div className="lg:col-span-7 space-y-6">
          <div className="w-full aspect-[4/3] bg-slate-900 rounded-[56px] shadow-2xl overflow-hidden relative border-[12px] border-white">
            <img 
              key={currentWork.id}
              src={currentWork.images?.[0] || currentWork.imageUrl} 
              className="w-full h-full object-cover"
              style={{ filter: `brightness(${(currentWork.brightness || 1) * 100}%)` }}
            />
            <div className="absolute bottom-0 left-0 h-2 bg-indigo-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / works.length) * 100}%` }} />
          </div>

          {/* コントローラー：インディゴ・ダーク基調 */}
          <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl text-white flex flex-col gap-6">
            <div className="flex items-center justify-center gap-10">
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev - 1 + works.length) % works.length); }} className="text-3xl text-slate-600 hover:text-white transition-colors"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 bg-indigo-500 text-white rounded-full flex items-center justify-center text-4xl shadow-2xl active:scale-95 transition-all">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev + 1) % works.length); }} className="text-3xl text-slate-600 hover:text-white transition-colors"><IoPlayForward /></button>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div className="flex bg-white/5 p-1 rounded-2xl">
                {[1, 2, 4].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={`px-5 py-2 rounded-xl text-[10px] font-black ${speed === s ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>x{s}</button>
                ))}
              </div>
              <div className="text-2xl font-black italic">{currentIndex + 1} <span className="text-slate-700 text-lg">/ {works.length}</span></div>
            </div>
          </div>
        </div>

        {/* 右側：コメント表示 */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[48px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <IoChatbubbleEllipsesOutline className="text-indigo-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Reflection</span>
              </div>
              {/* 文字色を黒に */}
              <p className="font-black text-slate-900 leading-relaxed italic text-lg whitespace-pre-wrap">
                {studentComment}
              </p>
            </div>
            {/* 装飾用のボトムバー */}
            <div className="p-6 bg-indigo-50/30">
               <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center italic">Portfolio Viewer Mode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentPortfolioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <StudentPortfolioContent />
    </Suspense>
  );
}