'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '../../../firebase/firebase'; // パスを調整
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  IoPlay, IoPause, IoPlayBack, IoPlayForward, 
  IoClose, IoChatbubbleEllipsesOutline, IoBulbOutline, 
  IoCloudUploadOutline, IoCheckmarkCircle 
} from 'react-icons/io5';

function PortfolioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitName = searchParams.get('unit');
  const customTitle = searchParams.get('title');
  
  const [works, setWorks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  // 1. 生徒情報の取得
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        const q = query(collection(db, "users"), where("email", "==", user.email.toLowerCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setStudentInfo(snap.docs[0].data());
        }
      }
    });
    return () => unsub();
  }, []);

  // 2. 作品データの取得
  useEffect(() => {
    const fetchWorks = async () => {
      if (!unitName) return;
      
      try {
        // unitNameに一致するタスクを探す
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const targetTaskIds = tasksSnap.docs
          .filter(d => (d.data().unitName || d.data().title) === unitName)
          .map(d => d.id);

        if (targetTaskIds.length === 0) {
          console.log("No tasks found for unit:", unitName);
          return;
        }

        // ログイン中のユーザーの、そのタスクの作品を取得
        const user = auth.currentUser;
        if (user) {
          const q = query(
            collection(db, "works"), 
            where("uid", "==", user.uid),
            where("taskId", "in", targetTaskIds)
          );
          
          const snap = await getDocs(q);
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          // 古い順に並べる（制作の過程が見えるように）
          data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
          setWorks(data);
        }
      } catch (error) {
        console.error("Error fetching works:", error);
      }
    };
    fetchWorks();
  }, [unitName]);

  // スライドショーのタイマー
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && works.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % works.length);
      }, 3000 / speed); // 少しゆったりめに設定
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, works.length]);

  // ギャラリーに公開
  const handlePublish = async () => {
    const currentWork = works[currentIndex];
    if (!currentWork || isPublishing || !studentInfo) {
      alert("公開するための情報が不足しています。");
      return;
    }
    
    const ok = confirm("この作品をクラスギャラリーに公開しますか？\n（クラスのみんなに見えるようになります）");
    if (!ok) return;

    setIsPublishing(true);
    try {
      const workRef = doc(db, "works", currentWork.id);
      
      await updateDoc(workRef, {
        isPublished: true,
        publishedAt: serverTimestamp(),
        classId: studentInfo.classId,
        studentName: studentInfo.studentName,
        studentNumber: studentInfo.studentNumber
      });
      
      const newWorks = [...works];
      newWorks[currentIndex].isPublished = true;
      setWorks(newWorks);
      
      alert("ギャラリーに公開しました！✨");
    } catch (e: any) {
      console.error(e);
      alert("公開に失敗しました。再試行してください。");
    } finally {
      setIsPublishing(false);
    }
  };

  if (works.length === 0) return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center font-black text-indigo-300 tracking-[0.3em] uppercase">
      <div className="animate-bounce mb-4 text-4xl">🎨</div>
      Generating Portfolio...
    </div>
  );

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-10 font-sans pb-32">
      {/* ヘッダーエリア */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Project Unit</p>
          <p className="font-black text-xl text-slate-800 truncate">{unitName}</p>
        </div>
        <div className="flex-[2] bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 italic">Focusing On</p>
            <p className="font-black text-xl text-slate-800 truncate">{currentWork.taskName || "課題"}</p>
          </div>
          {currentWork.isPublished && (
            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-2 rounded-bl-[24px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <IoCheckmarkCircle /> Published
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 左：ポートフォリオシネマ */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white py-4 px-8 rounded-[32px] shadow-sm border border-slate-100 inline-block">
             <h2 className="text-indigo-600 font-black text-2xl italic uppercase tracking-tighter">
              {customTitle || "My Journey"}
            </h2>
          </div>
          <div className="w-full aspect-[4/3] bg-slate-900 rounded-[56px] shadow-2xl overflow-hidden relative group border-[12px] border-white">
            <img 
              key={currentWork.id}
              src={currentWork.images?.[0] || currentWork.image} 
              className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000" 
              style={{ filter: `brightness(${(currentWork.brightness || 1) * 100}%)` }}
              alt="work"
            />
            {/* プログレスバー */}
            <div className="absolute bottom-0 left-0 h-2 bg-indigo-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / works.length) * 100}%` }} />
          </div>
        </div>

        {/* 右：コントロールパネル */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl text-white">
            <div className="flex items-center justify-center gap-8 mb-10">
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev - 1 + works.length) % works.length); }} className="text-3xl text-slate-600 hover:text-white transition-all hover:scale-125"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 bg-indigo-500 text-white rounded-full flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/40 active:scale-90 transition-all">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev + 1) % works.length); }} className="text-3xl text-slate-600 hover:text-white transition-all hover:scale-125"><IoPlayForward /></button>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-8">
              <div className="flex bg-white/5 p-1 rounded-2xl">
                {[1, 2, 4].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setSpeed(s)}
                    className={`px-5 py-2 rounded-xl font-black text-[10px] transition-all ${speed === s ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    x{s}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <span className="font-black text-3xl italic text-white tracking-tighter">
                  {currentIndex + 1}
                </span>
                <span className="font-black text-xl italic text-slate-700 tracking-tighter ml-1">
                  / {works.length}
                </span>
              </div>
            </div>

            <button 
              onClick={handlePublish}
              disabled={currentWork.isPublished || isPublishing}
              className={`w-full mt-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${currentWork.isPublished ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white text-slate-900 hover:bg-indigo-400 hover:text-white active:scale-95 shadow-xl hover:shadow-indigo-500/20'}`}
            >
              {currentWork.isPublished ? (
                <>公開済み</>
              ) : (
                <>{isPublishing ? "Processing..." : <><IoCloudUploadOutline size={20} /> クラスに公開する</>}</>
              )}
            </button>
          </div>

          {/* メッセージエリア */}
          <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden flex flex-col shadow-xl shadow-slate-200/50">
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <IoChatbubbleEllipsesOutline size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Self Reflection</span>
              </div>
              <p className="font-bold text-slate-600 leading-relaxed italic text-sm">
                {currentWork.comment || "（コメントはありません）"}
              </p>
            </div>

            <div className={`p-8 transition-all duration-500 ${currentWork.feedback ? 'bg-indigo-50/40' : 'bg-slate-50/30'}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentWork.feedback ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-300'}`}>
                  <IoBulbOutline size={16} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentWork.feedback ? 'text-indigo-600' : 'text-slate-400'}`}>
                  Teacher's Advice
                </span>
              </div>
              <p className={`font-black leading-relaxed text-sm ${currentWork.feedback ? 'text-indigo-900' : 'text-slate-300 italic'}`}>
                {currentWork.feedback || "先生からのアドバイスを待っています..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 閉じるボタン */}
      <button 
        onClick={() => router.back()}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:right-10 md:translate-x-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:scale-110 active:scale-90 transition-all z-50 group"
      >
        <IoClose size={32} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}

export default function PortfolioPlayer() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-200">LOADING...</div>}>
      <PortfolioContent />
    </Suspense>
  );
}