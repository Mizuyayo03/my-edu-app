'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db, auth } from '../../../firebase/firebase'; 
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
  const customTitle = searchParams.get('title'); // これが入力された作品名
  
  const [works, setWorks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [studentInfo, setStudentInfo] = useState<any>(null);

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

  useEffect(() => {
    const fetchWorks = async () => {
      if (!unitName) return;
      try {
        const tasksSnap = await getDocs(collection(db, "tasks"));
        const targetTaskIds = tasksSnap.docs
          .filter(d => (d.data().unitName || d.data().title) === unitName)
          .map(d => d.id);

        if (targetTaskIds.length === 0) return;

        const user = auth.currentUser;
        if (user) {
          const q = query(
            collection(db, "works"), 
            where("uid", "==", user.uid),
            where("taskId", "in", targetTaskIds)
          );
          const snap = await getDocs(q);
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          data.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
          setWorks(data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchWorks();
  }, [unitName]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && works.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % works.length);
      }, 3000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, works.length]);

  // ★ 修正ポイント：公開時に「作品名」と「単元名」を保存するようにしました
  const handlePublish = async () => {
    // 全ての作品（スライド）に情報を付与して公開する
    if (works.length === 0 || isPublishing || !studentInfo) {
      alert("公開するための情報が不足しています。");
      return;
    }
    
    const ok = confirm(`「${customTitle || unitName}」をクラスギャラリーに公開しますか？`);
    if (!ok) return;

    setIsPublishing(true);
    try {
      // 制作過程すべてを公開設定にする
      const publishPromises = works.map(work => {
        const workRef = doc(db, "works", work.id);
        return updateDoc(workRef, {
          isPublished: true,
          publishedAt: serverTimestamp(),
          classId: studentInfo.classId,
          studentName: studentInfo.studentName,
          studentNumber: studentInfo.studentNumber,
          portfolioTitle: customTitle || "無題の作品", // ★入力された作品名を保存
          unitName: unitName || "単元未設定"           // ★単元名も保存
        });
      });

      await Promise.all(publishPromises);
      
      const newWorks = works.map(w => ({ ...w, isPublished: true }));
      setWorks(newWorks);
      
      alert("ギャラリーに公開しました！✨");
    } catch (e: any) {
      console.error(e);
      alert("公開に失敗しました。");
    } finally {
      setIsPublishing(false);
    }
  };

  if (works.length === 0) return (
    <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center font-black text-indigo-300">
      Generating Portfolio...
    </div>
  );

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-10 font-sans pb-32">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Project Unit</p>
          <p className="font-black text-xl text-slate-800 truncate">{unitName}</p>
        </div>
        <div className="flex-[2] bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Focusing On</p>
            <p className="font-black text-xl text-slate-800 truncate">{currentWork.taskName || "課題"}</p>
          </div>
          {currentWork.isPublished && (
            <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-2 rounded-bl-[24px] text-[10px] font-black flex items-center gap-2">
              <IoCheckmarkCircle /> Published
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
              className="w-full h-full object-cover" 
              style={{ filter: `brightness(${(currentWork.brightness || 1) * 100}%)` }}
              alt="work"
            />
            <div className="absolute bottom-0 left-0 h-2 bg-indigo-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / works.length) * 100}%` }} />
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl text-white">
            <div className="flex items-center justify-center gap-8 mb-10">
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev - 1 + works.length) % works.length); }} className="text-3xl text-slate-600 hover:text-white"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 bg-indigo-500 text-white rounded-full flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/40">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev + 1) % works.length); }} className="text-3xl text-slate-600 hover:text-white"><IoPlayForward /></button>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/10 pt-8">
              <div className="flex bg-white/5 p-1 rounded-2xl">
                {[1, 2, 4].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={`px-5 py-2 rounded-xl font-black text-[10px] ${speed === s ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>x{s}</button>
                ))}
              </div>
              <div className="text-right">
                <span className="font-black text-3xl italic text-white tracking-tighter">{currentIndex + 1}</span>
                <span className="font-black text-xl italic text-slate-700 tracking-tighter ml-1">/ {works.length}</span>
              </div>
            </div>

            <button 
              onClick={handlePublish}
              disabled={currentWork.isPublished || isPublishing}
              className={`w-full mt-8 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${currentWork.isPublished ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white text-slate-900 hover:bg-indigo-400 hover:text-white'}`}
            >
              {currentWork.isPublished ? <>公開済み</> : <>{isPublishing ? "Processing..." : <><IoCloudUploadOutline size={20} /> クラスに公開する</>}</>}
            </button>
          </div>

          <div className="bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden flex flex-col shadow-xl">
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Self Reflection</span>
              </div>
              <p className="font-bold text-slate-600 leading-relaxed italic text-sm">
                {currentWork.comment || "（コメントはありません）"}
              </p>
            </div>
            <div className={`p-8 ${currentWork.feedback ? 'bg-indigo-50/40' : 'bg-slate-50/30'}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${currentWork.feedback ? 'text-indigo-600' : 'text-slate-400'}`}>Teacher's Advice</span>
              </div>
              <p className={`font-black leading-relaxed text-sm ${currentWork.feedback ? 'text-indigo-900' : 'text-slate-300 italic'}`}>
                {currentWork.feedback || "先生からのアドバイスを待っています..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button onClick={() => router.back()} className="fixed bottom-8 right-10 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl text-slate-400 hover:text-indigo-600 z-50">
        <IoClose size={32} />
      </button>
    </div>
  );
}

export default function PortfolioPlayer() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black text-slate-200">LOADING...</div>}>
      <PortfolioContent />
    </Suspense>
  );
}