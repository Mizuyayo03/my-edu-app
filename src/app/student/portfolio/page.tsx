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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 animate-pulse tracking-widest uppercase">
      Loading Portfolio...
    </div>
  );

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 font-sans">
      {/* 上部：単元名と課題名 */}
      <div className="max-w-5xl mx-auto flex gap-4 mb-8">
        <div className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-white">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Unit</p>
          <p className="font-black text-lg truncate">{unitName}</p>
        </div>
        <div className="flex-[2] bg-white p-6 rounded-[32px] shadow-sm border border-white">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Current Task</p>
          <p className="font-black text-lg truncate">{currentWork.taskName || "課題"}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左側：メイン作品表示 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 rounded-[32px] shadow-sm border border-white text-center">
             <h2 className="text-indigo-600 font-black text-xl italic uppercase tracking-tighter">
              {customTitle}
            </h2>
          </div>
          <div className="w-full aspect-video bg-white rounded-[48px] shadow-xl shadow-indigo-100/50 border-8 border-white flex items-center justify-center overflow-hidden">
            <img 
              src={currentWork.images?.[0]} 
              className="w-full h-full object-contain" 
              alt="work"
            />
          </div>
        </div>

        {/* 右側：コントロール & コメント */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 再生コントロールボックス */}
          <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-indigo-50 border border-white">
            <div className="flex items-center justify-center gap-8 mb-8">
              <button onClick={() => setCurrentIndex((prev) => (prev - 1 + works.length) % works.length)} className="text-3xl text-slate-300 hover:text-indigo-500 transition-colors"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl shadow-lg shadow-indigo-200 active:scale-90 transition-all">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => setCurrentIndex((prev) => (prev + 1) % works.length)} className="text-3xl text-slate-300 hover:text-indigo-500 transition-colors"><IoPlayForward /></button>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-6">
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${speed === s ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-300'}`}
                  >
                    x{s}
                  </button>
                ))}
              </div>
              <span className="font-black text-2xl italic text-slate-200 tracking-tighter">
                {currentIndex + 1} / {works.length}
              </span>
            </div>
          </div>

          {/* コメントエリア（履歴画面のカード風デザイン） */}
          <div className="bg-white rounded-[48px] shadow-sm border border-white overflow-hidden flex flex-col min-h-[320px]">
            <div className="flex-1 p-8 border-b border-slate-50">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block">My Comment</span>
              <p className="font-bold text-slate-600 leading-relaxed">
                {currentWork.comment || "コメントなし"}
              </p>
            </div>
            <div className="flex-1 p-8 bg-indigo-50/30">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 block italic">Teacher Feedback</span>
              <p className="font-bold text-indigo-900/80 italic leading-relaxed">
                {currentWork.teacherFeedback || "フィードバック待ち..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 閉じるボタン（履歴画面の戻るボタンと同じスタイル） */}
      <button 
        onClick={() => router.back()}
        className="fixed bottom-10 right-10 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 font-black text-slate-300 hover:text-red-500 transition-all text-3xl"
      >
        <IoClose />
      </button>
    </div>
  );
}

export default function PortfolioPlayer() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PortfolioContent />
    </Suspense>
  );
}