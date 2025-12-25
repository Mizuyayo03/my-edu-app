'use client';
import React, { useState, useEffect, Suspense } from 'react'; // Suspenseを追加
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '@/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore'; // orderByを外す
import { IoPlay, IoPause, IoPlayBack, IoPlayForward, IoClose } from 'react-icons/io5';

function PortfolioContent() { // Suspense用に中身を分離
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
        // 1. まず全ての課題(tasks)を取得して、この単元(unitName)に属するtaskIdを特定する
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const targetTaskIds = tasksSnap.docs
          .filter(d => (d.data().unitName || d.data().title) === unitName)
          .map(d => d.id);

        if (targetTaskIds.length === 0) return;

        // 2. 特定したtaskIdのいずれかに一致する自分の作品を取得
        const q = query(
          collection(db, "works"), 
          where("uid", "==", auth.currentUser.uid),
          where("taskId", "in", targetTaskIds) // 単元に含まれる全課題IDで検索
        );
        
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // メモリ上でソート（インデックスエラー回避）
        data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        
        setWorks(data);
      }
    };
    fetchWorks();
  }, [unitName]);

  // 自動再生タイマー (変更なし)
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 italic uppercase">
      作品を読み込み中...
    </div>
  );

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 font-sans">
      {/* ヘッダーエリア */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 p-6 border-4 border-slate-900 rounded-2xl font-black text-center text-xl bg-slate-50">
          <p className="text-[10px] text-slate-400 uppercase mb-1">Unit</p>
          {unitName}
        </div>
        <div className="flex-[2] p-6 border-4 border-slate-900 rounded-2xl font-black text-center text-xl bg-slate-50">
          <p className="text-[10px] text-slate-400 uppercase mb-1">Task</p>
          {currentWork.taskName || "課題名"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左側：作品 */}
        <div className="lg:col-span-7">
          <div className="w-full p-4 border-4 border-slate-900 rounded-2xl font-black text-center mb-4 text-2xl bg-indigo-50 italic">
            {customTitle}
          </div>
          <div className="w-full aspect-video border-4 border-slate-900 rounded-[40px] flex items-center justify-center overflow-hidden bg-slate-100 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
            <img src={currentWork.images?.[0]} className="w-full h-full object-contain p-2" />
          </div>
        </div>

        {/* 右側：コントロールとコメント */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* コントロール */}
          <div className="bg-white p-6 border-4 border-slate-900 rounded-[32px] shadow-sm">
            <div className="flex items-center justify-center gap-8 mb-4">
              <button onClick={() => setCurrentIndex((prev) => (prev - 1 + works.length) % works.length)} className="text-3xl"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-3xl">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => setCurrentIndex((prev) => (prev + 1) % works.length)} className="text-3xl"><IoPlayForward /></button>
            </div>
            <div className="flex justify-between items-center border-t-2 pt-4">
              <div className="flex gap-2">
                {[1, 2, 3].map(s => (
                  <button key={s} onClick={() => setSpeed(s)} className={`px-4 py-1 rounded-lg font-black ${speed === s ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}>x{s}</button>
                ))}
              </div>
              <span className="font-black text-2xl text-slate-400 italic">({currentIndex + 1}/{works.length})</span>
            </div>
          </div>

          {/* コメントエリア */}
          <div className="flex-1 border-4 border-slate-900 rounded-[60px] overflow-hidden flex flex-col bg-slate-50 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex-1 p-8 border-b-4 border-slate-900">
              <p className="font-black text-indigo-500 text-[10px] uppercase mb-2">感想コメント</p>
              <p className="font-bold text-slate-700">{currentWork.comment || "コメントはありません"}</p>
            </div>
            <div className="flex-1 p-8 bg-indigo-50/30">
              <p className="font-black text-indigo-500 text-[10px] uppercase mb-2">先生からのコメント</p>
              <p className="font-bold text-indigo-900 italic">{currentWork.teacherFeedback || "まだありません"}</p>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => router.back()} className="fixed bottom-10 right-10 w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-xl border-4 border-slate-900 transition-all active:scale-95">
        <IoClose size={36} />
      </button>
    </div>
  );
}

// useSearchParamsを使うためにSuspenseでラップ
export default function PortfolioPlayer() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PortfolioContent />
    </Suspense>
  );
}