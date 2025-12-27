'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoClose, IoChatbubbleEllipsesOutline, IoBulbOutline } from 'react-icons/io5';

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
        // 1. 全課題を取得して、選択された単元に属するtaskIdを特定
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const targetTaskIds = tasksSnap.docs
          .filter(d => (d.data().unitName || d.data().title) === unitName)
          .map(d => d.id);

        if (targetTaskIds.length === 0) return;

        // 2. 自分の提出物を取得
        const q = query(
          collection(db, "works"), 
          where("uid", "==", auth.currentUser.uid),
          where("taskId", "in", targetTaskIds)
        );
        
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        // 作成日時順に並び替え
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
      }, 2000 / speed); // 少しゆっくりめに調整（2秒/スピード）
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
      {/* 上部：ヘッダー */}
      <div className="max-w-5xl mx-auto flex gap-4 mb-8">
        <div className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Unit</p>
          <p className="font-black text-lg truncate text-slate-800">{unitName}</p>
        </div>
        <div className="flex-[2] bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Current Task</p>
          <p className="font-black text-lg truncate text-slate-800">{currentWork.taskName || "課題"}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左側：メイン作品表示 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 text-center">
             <h2 className="text-indigo-600 font-black text-xl italic uppercase tracking-tighter">
              {customTitle || "My Journey"}
            </h2>
          </div>
          <div className="w-full aspect-[4/3] bg-white rounded-[48px] shadow-2xl shadow-indigo-100/50 border-8 border-white flex items-center justify-center overflow-hidden relative">
            <img 
              src={currentWork.images?.[0] || currentWork.image} 
              className="w-full h-full object-cover transition-all duration-700" 
              style={{ filter: `brightness(${currentWork.brightness || 1})` }} // 明るさを反映
              alt="work"
            />
          </div>
        </div>

        {/* 右側：コントロール & メッセージ */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 再生コントロール */}
          <div className="bg-slate-900 p-8 rounded-[40px] shadow-2xl text-white">
            <div className="flex items-center justify-center gap-8 mb-8">
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev - 1 + works.length) % works.length); }} className="text-3xl text-slate-500 hover:text-white transition-colors"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-indigo-500 text-white rounded-full flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30 active:scale-90 transition-all">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev + 1) % works.length); }} className="text-3xl text-slate-500 hover:text-white transition-colors"><IoPlayForward /></button>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div className="flex gap-2">
                {[1, 2, 4].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${speed === s ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}
                  >
                    x{s}
                  </button>
                ))}
              </div>
              <span className="font-black text-2xl italic text-white/20 tracking-tighter">
                {currentIndex + 1} / {works.length}
              </span>
            </div>
          </div>

          {/* コメント・フィードバックエリア */}
          <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden flex flex-col shadow-xl shadow-slate-200/50">
            {/* 自分のコメント */}
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <IoChatbubbleEllipsesOutline className="text-slate-300" size={18} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My Comment</span>
              </div>
              <p className="font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                {currentWork.comment || "コメントなし"}
              </p>
            </div>

            {/* 先生からのフィードバック 💡ここを修正 */}
            <div className={`p-8 transition-colors duration-500 ${currentWork.feedback ? 'bg-indigo-50/50' : 'bg-slate-50/30'}`}>
              <div className="flex items-center gap-2 mb-3">
                <IoBulbOutline className={currentWork.feedback ? "text-indigo-500" : "text-slate-300"} size={18} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${currentWork.feedback ? 'text-indigo-500' : 'text-slate-400'}`}>
                  Teacher's Advice
                </span>
              </div>
              <p className={`font-bold leading-relaxed whitespace-pre-wrap ${currentWork.feedback ? 'text-indigo-900' : 'text-slate-300 italic'}`}>
                {currentWork.feedback || "先生からのアドバイスを待っています..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 閉じるボタン */}
      <button 
        onClick={() => router.back()}
        className="fixed bottom-10 right-10 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl border border-slate-100 font-black text-slate-300 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all text-3xl z-50"
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