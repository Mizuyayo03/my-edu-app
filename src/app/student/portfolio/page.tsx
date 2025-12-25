'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoClose } from 'react-icons/io5';

function PortfolioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitName = searchParams.get('unit');
  const customTitle = searchParams.get('title');
  
  const [works, setWorks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const fetchWorks = async () => {
      if (auth.currentUser && unitName) {
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const targetTaskIds = tasksSnap.docs
          .filter(d => (d.data().unitName || d.data().title) === unitName)
          .map(d => d.id);

        if (targetTaskIds.length === 0) return;

        const q = query(
          collection(db, "works"), 
          where("uid", "==", auth.currentUser.uid),
          where("taskId", "in", targetTaskIds)
        );
        
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setWorks(data);
      }
    };
    fetchWorks();
  }, [unitName]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && works.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % works.length);
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, works.length]);

  if (works.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-indigo-300 animate-pulse tracking-[0.3em]">
      GENERATING...
    </div>
  );

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 font-sans">
      {/* 1. 上部：単元名と課題名（図面レイアウト） */}
      <div className="max-w-6xl mx-auto flex gap-4 mb-8">
        <div className="flex-1 bg-white p-5 border-[3px] border-slate-900 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Unit</p>
          <p className="font-black text-lg md:text-xl truncate">{unitName}</p>
        </div>
        <div className="flex-[2] bg-white p-5 border-[3px] border-slate-900 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Task</p>
          <p className="font-black text-lg md:text-xl truncate">{currentWork.taskName || "課題"}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左側：作品メイン */}
        <div className="lg:col-span-7 space-y-6">
          <div className="w-full p-4 bg-indigo-600 border-[3px] border-slate-900 rounded-[20px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="text-white font-black text-center text-xl italic uppercase tracking-tighter">
              {customTitle}
            </h2>
          </div>
          <div className="w-full aspect-video bg-white border-[3px] border-slate-900 rounded-[40px] flex items-center justify-center overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <img 
              src={currentWork.images?.[0]} 
              className="w-full h-full object-contain p-4" 
              alt="work"
            />
          </div>
        </div>

        {/* 右側：コントロール & コメント */}
        <div className="lg:col-span-5 flex flex-col gap-6 h-full">
          {/* 再生コントロール */}
          <div className="bg-white p-6 border-[3px] border-slate-900 rounded-[32px] shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center justify-center gap-8 mb-6">
              <button onClick={() => setCurrentIndex((prev) => (prev - 1 + works.length) % works.length)} className="text-3xl hover:scale-110 active:scale-90 transition-all"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-3xl shadow-lg active:scale-95 transition-all">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => setCurrentIndex((prev) => (prev + 1) % works.length)} className="text-3xl hover:scale-110 active:scale-90 transition-all"><IoPlayForward /></button>
            </div>
            
            <div className="flex items-center justify-between border-t-[3px] border-slate-100 pt-5">
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`w-10 h-10 rounded-full font-black text-xs transition-all border-2 border-slate-900 ${speed === s ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-400'}`}
                  >
                    x{s}
                  </button>
                ))}
              </div>
              <span className="font-black text-2xl italic text-slate-900 tracking-tighter">
                {currentIndex + 1} <span className="text-slate-300 text-lg">/</span> {works.length}
              </span>
            </div>
          </div>

          {/* コメントエリア（図面通りの上下分割ボックス） */}
          <div className="flex-1 bg-white border-[3px] border-slate-900 rounded-[48px] overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] min-h-[300px]">
            <div className="flex-1 p-7 border-b-[3px] border-slate-900">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase mb-3">My Comment</span>
              <p className="font-bold text-slate-700 leading-relaxed text-sm overflow-y-auto max-h-[100px]">
                {currentWork.comment || "振り返りコメントはまだありません"}
              </p>
            </div>
            <div className="flex-1 p-7 bg-indigo-50/50">
              <span className="inline-block px-3 py-1 bg-white text-indigo-500 border border-indigo-200 rounded-full text-[10px] font-black uppercase mb-3">Teacher's Feedback</span>
              <p className="font-bold text-indigo-900 italic leading-relaxed text-sm overflow-y-auto max-h-[100px]">
                {currentWork.teacherFeedback || "先生からのコメントを待っています..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 閉じるボタン */}
      <button 
        onClick={() => router.back()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-white text-slate-900 border-[3px] border-slate-900 rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-red-50 hover:text-red-500 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        <IoClose size={36} />
      </button>
    </div>
  );
}

export default function PortfolioPlayer() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-black">LOADING...</div>}>
      <PortfolioContent />
    </Suspense>
  );
}