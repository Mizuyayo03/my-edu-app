'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoClose } from 'react-icons/io5';

export default function PortfolioPlayer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitName = searchParams.get('unit');
  const customTitle = searchParams.get('title'); // ユーザーが入力した作品名
  
  const [works, setWorks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true); // 最初から再生
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    const fetchWorks = async () => {
      if (auth.currentUser && unitName) {
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && works.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % works.length);
      }, 1000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, works.length]);

  if (works.length === 0) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black">作品を読み込み中...</div>;

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 font-sans">
      {/* 1枚目イメージの上部：単元名と課題名 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 p-6 border-2 border-slate-900 rounded-md font-black text-center text-xl">
          {unitName}
        </div>
        <div className="flex-[2] p-6 border-2 border-slate-900 rounded-md font-black text-center text-xl">
          {currentWork.title || "課題名"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          {/* 作品タイトル */}
          <div className="w-full p-4 border-2 border-slate-900 rounded-md font-black text-center mb-4 text-xl">
            {customTitle}
          </div>
          {/* メイン作品 */}
          <div className="w-full aspect-[4/3] border-2 border-slate-900 rounded-md flex items-center justify-center overflow-hidden">
            <img src={currentWork.images?.[0]} className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* コントロール */}
          <div className="flex items-center justify-center gap-8 p-4 border-2 border-slate-900 rounded-md">
            <button onClick={() => setCurrentIndex((prev) => (prev - 1 + works.length) % works.length)} className="text-3xl"><IoPlayBack /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="text-4xl">
              {isPlaying ? <IoPause /> : <IoPlay />}
            </button>
            <button onClick={() => setCurrentIndex((prev) => (prev + 1) % works.length)} className="text-3xl"><IoPlayForward /></button>
            <span className="font-black text-2xl ml-4">({currentIndex + 1}/{works.length})</span>
          </div>

          {/* コメントエリア（右下の丸角ボックス） */}
          <div className="flex-1 border-2 border-slate-900 rounded-[60px] overflow-hidden flex flex-col">
            <div className="flex-1 p-8 border-b-2 border-slate-900">
              <p className="font-black text-lg mb-2">感想コメント</p>
              <p className="font-bold text-slate-600">{currentWork.comment || "コメントはありません"}</p>
            </div>
            <div className="flex-1 p-8">
              <p className="font-black text-lg mb-2">先生からのコメント</p>
              <p className="font-bold text-indigo-600 italic">{currentWork.teacherFeedback || "まだコメントはありません"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 閉じるボタン */}
      <button 
        onClick={() => router.back()}
        className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all"
      >
        <IoClose size={32} />
      </button>
    </div>
  );
}