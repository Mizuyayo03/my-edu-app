'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/firebase'; // パスは適宜調整
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoClose } from 'react-icons/io5';

export default function PortfolioPlayer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitName = searchParams.get('unit');
  
  const [works, setWorks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1, 2, 3倍速

  // 1. データの取得
  useEffect(() => {
    const fetchWorks = async () => {
      const u = auth.currentUser;
      if (u && unitName) {
        const q = query(
          collection(db, "works"), 
          where("uid", "==", u.uid),
          where("taskName", "==", unitName),
          orderBy("createdAt", "asc")
        );
        const snap = await getDocs(q);
        setWorks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    };
    fetchWorks();
  }, [unitName]);

  // 2. 自動再生ロジック
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && works.length > 0) {
      const intervalTime = 1000 / speed;
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % works.length);
      }, intervalTime);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, works.length]);

  if (works.length === 0) return <div>読み込み中...</div>;

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col items-center">
      {/* ヘッダーエリア */}
      <div className="w-full max-w-5xl flex justify-between items-start mb-4">
        <div className="flex gap-4">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] text-white/50 font-bold uppercase">単元名</p>
            <h2 className="text-lg font-black">{unitName}</h2>
          </div>
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
            <p className="text-[10px] text-white/50 font-bold uppercase">課題名</p>
            <h2 className="text-lg font-black">{currentWork.taskName}</h2>
          </div>
        </div>
        <button onClick={() => router.back()} className="p-4 bg-white/10 rounded-full hover:bg-white/20">
          <IoClose size={24} />
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左：メイン作品エリア */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/5 rounded-[40px] p-2 aspect-video flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl">
            <img 
              src={currentWork.images?.[0]} 
              className="w-full h-full object-contain rounded-[32px] transition-all duration-300"
              alt="work"
            />
          </div>
          <div className="bg-white/10 p-6 rounded-3xl border border-white/10 text-center font-black text-xl italic tracking-widest text-indigo-300">
            {currentWork.title || "My Work Title"}
          </div>
        </div>

        {/* 右：コントロールとコメント */}
        <div className="space-y-6">
          {/* 再生コントロール */}
          <div className="bg-indigo-600 p-6 rounded-[40px] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setCurrentIndex(prev => (prev - 1 + works.length) % works.length)}><IoPlayBack size={24}/></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="bg-white text-indigo-600 p-4 rounded-full">
                {isPlaying ? <IoPause size={28}/> : <IoPlay size={28}/>}
              </button>
              <button onClick={() => setCurrentIndex(prev => (prev + 1) % works.length)}><IoPlayForward size={24}/></button>
            </div>
            <div className="flex justify-between items-center font-black">
              <span className="text-sm opacity-60">({currentIndex + 1}/{works.length})</span>
              <div className="flex gap-2 text-[10px]">
                {[1, 2, 3].map(v => (
                  <button 
                    key={v}
                    onClick={() => setSpeed(v)}
                    className={`w-8 h-8 rounded-full border ${speed === v ? 'bg-white text-indigo-600' : 'border-white/30'}`}
                  >x{v}</button>
                ))}
              </div>
            </div>
          </div>

          {/* コメントエリア */}
          <div className="bg-white rounded-[40px] p-8 text-slate-800 flex flex-col gap-6 min-h-[300px]">
             <div>
               <p className="text-[10px] font-black text-indigo-500 uppercase mb-2">感想コメント</p>
               <p className="font-bold leading-relaxed text-sm">“{currentWork.comment || "未記入"}”</p>
             </div>
             <div className="border-t border-slate-100 pt-6">
               <p className="text-[10px] font-black text-emerald-500 uppercase mb-2">先生からのコメント</p>
               <p className="font-bold leading-relaxed text-sm text-slate-400 italic">
                 {currentWork.teacherFeedback || "まだコメントはありません"}
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}