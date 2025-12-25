'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoClose } from 'react-icons/io5';

function PortfolioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitName = searchParams.get('unit');
  const customTitle = searchParams.get('title');
  
  const [works, setWorks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1); // 再生速度 (1, 2, 3)

  useEffect(() => {
    const fetchWorks = async () => {
      if (auth.currentUser && unitName) {
        // ※ここで FirebaseError が出ていたので、インデックス作成が必要です
        const q = query(
          collection(db, "works"), 
          where("uid", "==", auth.currentUser.uid),
          where("taskName", "==", unitName),
          orderBy("createdAt", "asc")
        );
        const snap = await getDocs(q);
        setWorks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    };
    fetchWorks();
  }, [unitName]);

  // 自動再生のタイマー処理
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && works.length > 0) {
      // 1000ms(1秒) を speed で割ることで速度を変化させる
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % works.length);
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, works.length]);

  if (works.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 italic animate-pulse uppercase tracking-[0.3em]">
      Generating Portfolio...
    </div>
  );

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 font-sans">
      {/* 上部：単元名と課題名（図のレイアウト通り） */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 p-6 border-4 border-slate-900 rounded-2xl font-black text-center text-xl bg-slate-50">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Unit</p>
          {unitName}
        </div>
        <div className="flex-[2] p-6 border-4 border-slate-900 rounded-2xl font-black text-center text-xl bg-slate-50">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Task</p>
          {currentWork.taskName || "課題名"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 左側：作品メインエリア */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full p-4 border-4 border-slate-900 rounded-2xl font-black text-center text-2xl bg-indigo-50 italic">
            {customTitle}
          </div>
          <div className="w-full aspect-video border-4 border-slate-900 rounded-[40px] flex items-center justify-center overflow-hidden bg-slate-100 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <img 
              src={currentWork.images?.[0]} 
              className="w-full h-full object-contain p-2" 
              alt="portfolio work"
            />
          </div>
        </div>

        {/* 右側：コントロールとコメント */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 再生コントロールボックス */}
          <div className="bg-white p-6 border-4 border-slate-900 rounded-[32px] shadow-sm">
            <div className="flex items-center justify-center gap-6 mb-6">
              <button onClick={() => setCurrentIndex((prev) => (prev - 1 + works.length) % works.length)} className="text-3xl hover:scale-110 transition-transform"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-3xl shadow-lg shadow-indigo-100 active:scale-90 transition-all">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => setCurrentIndex((prev) => (prev + 1) % works.length)} className="text-3xl hover:scale-110 transition-transform"><IoPlayForward /></button>
            </div>
            
            <div className="flex items-center justify-between border-t-2 border-slate-100 pt-6">
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${speed === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                  >
                    x{s}
                  </button>
                ))}
              </div>
              <span className="font-black text-2xl italic text-slate-400">({currentIndex + 1} / {works.length})</span>
            </div>
          </div>

          {/* コメントエリア（丸角ボックスを上下で分割） */}
          <div className="flex-1 border-4 border-slate-900 rounded-[60px] overflow-hidden flex flex-col bg-slate-50 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex-1 p-8 border-b-4 border-slate-900 flex flex-col">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 italic">Student Comment</span>
              <p className="font-bold text-slate-700 leading-relaxed overflow-y-auto">
                {currentWork.comment || "振り返りコメントはありません"}
              </p>
            </div>
            <div className="flex-1 p-8 bg-indigo-50/50 flex flex-col">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 italic">Teacher Feedback</span>
              <p className="font-bold text-indigo-900 leading-relaxed overflow-y-auto">
                {currentWork.teacherFeedback || "先生からのコメントはまだありません"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 右下の閉じるボタン */}
      <button 
        onClick={() => router.back()}
        className="fixed bottom-10 right-10 w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-red-600 hover:rotate-90 active:scale-95 transition-all z-50 border-4 border-slate-900"
      >
        <IoClose size={36} />
      </button>
    </div>
  );
}

export default function PortfolioPlayer() {
  return (
    <Suspense>
      <PortfolioContent />
    </Suspense>
  );
}