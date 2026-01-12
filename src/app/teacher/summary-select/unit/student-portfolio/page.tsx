'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../../../../firebase/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { 
  IoPlay, IoPause, IoPlayBack, IoPlayForward, 
  IoChevronBack, IoChatbubbleEllipsesOutline, IoBulbOutline, IoClose 
} from 'react-icons/io5';

// 型定義
interface WorkData {
  id: string;
  images?: string[];
  imageUrl?: string; 
  studentName: string;
  unitName?: string;    // 単元名
  taskName?: string;    // 課題名（生徒の提出コードで使用）
  feedback?: string;    // アドバイス（かつ、一部データで単元名がここに入っている）
  portfolioTitle?: string;
  reflection?: string;
  comment?: string;   
  brightness?: number;
  createdAt?: Timestamp;
}

function StudentPortfolioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unitParam = searchParams.get('unit'); // URLの ?unit=動作確認
  const studentParam = searchParams.get('student'); // URLの ?student=テスト生徒
  
  const [works, setWorks] = useState<WorkData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [feedbackText, setFeedbackText] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchWorks() {
      if (!unitParam || !studentParam) return;
      try {
        setLoading(true);

        // 💡 1. 複合インデックスを前提としたクエリ (unitName版)
        const qUnit = query(
          collection(db, "works"),
          where("studentName", "==", studentParam),
          where("unitName", "==", unitParam),
          orderBy("createdAt", "asc")
        );

        // 💡 2. 複合インデックスを前提としたクエリ (taskName版: upload.tsxの仕様)
        // ※unitName版でヒットしなかった場合の予備
        const qTask = query(
          collection(db, "works"),
          where("studentName", "==", studentParam),
          where("taskName", "==", unitParam),
          orderBy("createdAt", "asc")
        );
        
        const [snapUnit, snapTask] = await Promise.all([getDocs(qUnit), getDocs(qTask)]);
        
        // 両方の結果をマージ（重複を排除）
        const combinedMap = new Map();
        [...snapUnit.docs, ...snapTask.docs].forEach(d => {
          combinedMap.set(d.id, { id: d.id, ...d.data() });
        });

        const sortedData = Array.from(combinedMap.values()) as WorkData[];
        // マージ後に再度日付順にソート
        sortedData.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

        setWorks(sortedData);
        
        if (sortedData.length > 0) {
          const initialFB = sortedData[0].feedback;
          setFeedbackText(initialFB === unitParam ? "" : (initialFB || ""));
        }

      } catch (error: any) {
        console.error("❌ Firestore Error:", error);
        if (error.message?.includes("index")) {
          console.warn("⚠️ インデックスが未作成または構築中です。URLを確認してください:", error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, [unitParam, studentParam]);

  // 自動再生ロジック
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && works.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % works.length);
      }, 3000 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, works.length]);

  // スライド切り替え時に入力欄を同期
  useEffect(() => {
    if (works[currentIndex]) {
      const fb = works[currentIndex].feedback;
      setFeedbackText(fb === unitParam ? "" : (fb || ""));
    }
  }, [currentIndex, works, unitParam]);

  // アドバイスの保存
  const handleSaveFeedback = async () => {
    const currentWork = works[currentIndex];
    if (!currentWork) return;

    setIsUpdating(true);
    try {
      const workRef = doc(db, "works", currentWork.id);
      await updateDoc(workRef, { feedback: feedbackText });
      
      const updatedWorks = works.map((w, i) => 
        i === currentIndex ? { ...w, feedback: feedbackText } : w
      );
      setWorks(updatedWorks);
      alert("アドバイスを保存しました！");
    } catch (e) {
      console.error(e);
      alert("保存に失敗しました。");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-400">LOADING...</div>;
  
  if (works.length === 0) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10">
      <div className="bg-white p-12 rounded-[48px] shadow-sm border text-center">
        <p className="text-slate-300 font-black text-2xl mb-4 italic uppercase">No Works found</p>
        <p className="text-slate-500 font-bold mb-8">「{unitParam}」に一致する作品が見つかりません</p>
        <button onClick={() => router.back()} className="px-8 py-3 bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase">Back</button>
      </div>
    </div>
  );

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans pb-32">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all">
            <IoChevronBack size={20} />
          </button>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase mb-0.5 tracking-widest leading-none italic">Unit</p>
            <p className="font-black text-lg text-slate-800 truncate leading-none uppercase italic">{unitParam}</p>
          </div>
        </div>
        <div className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center font-black italic uppercase">
          <p className="text-[10px] font-black text-indigo-400 mb-1 leading-none">Student</p>
          {studentParam}
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="w-full aspect-[4/3] bg-slate-900 rounded-[56px] shadow-2xl overflow-hidden relative border-[12px] border-white">
            <img 
              key={currentWork.id}
              src={currentWork.images?.[0] || currentWork.imageUrl} 
              className="w-full h-full object-cover" 
              style={{ filter: `brightness(${(currentWork.brightness || 1) * 100}%)` }}
              alt="work"
            />
            <div className="absolute bottom-0 left-0 h-2 bg-indigo-500 transition-all duration-300" style={{ width: `${((currentIndex + 1) / works.length) * 100}%` }} />
          </div>
          
          <div className="bg-slate-900 p-8 rounded-[48px] shadow-2xl text-white flex flex-col gap-6 font-black italic">
            <div className="flex items-center justify-center gap-10">
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev - 1 + works.length) % works.length); }} className="text-3xl text-slate-600 hover:text-white"><IoPlayBack /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 bg-indigo-500 text-white rounded-full flex items-center justify-center text-4xl shadow-2xl">
                {isPlaying ? <IoPause /> : <IoPlay className="ml-1" />}
              </button>
              <button onClick={() => { setIsPlaying(false); setCurrentIndex((prev) => (prev + 1) % works.length); }} className="text-3xl text-slate-600 hover:text-white"><IoPlayForward /></button>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div className="flex bg-white/5 p-1 rounded-2xl">
                {[1, 2, 4].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={`px-5 py-2 rounded-xl text-[10px] ${speed === s ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}>x{s}</button>
                ))}
              </div>
              <div className="text-2xl">{currentIndex + 1} <span className="text-slate-700 text-lg">/ {works.length}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white rounded-[48px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-4">
                <IoChatbubbleEllipsesOutline className="text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reflection</span>
              </div>
              <p className="font-bold text-slate-700 leading-relaxed italic text-sm">
                {currentWork.reflection || currentWork.comment || "（コメントなし）"}
              </p>
            </div>
            <div className="p-8 bg-indigo-50/40">
              <div className="flex items-center gap-2 mb-4 text-indigo-600">
                <IoBulbOutline />
                <span className="text-[10px] font-black uppercase tracking-widest">Advice</span>
              </div>
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="アドバイスを入力..."
                className="w-full bg-white border border-indigo-100 rounded-[24px] p-6 text-sm font-bold text-indigo-900 outline-none min-h-[140px] mb-4"
              />
              <button 
                onClick={handleSaveFeedback}
                disabled={isUpdating}
                className="w-full py-4 bg-indigo-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700"
              >
                {isUpdating ? "Saving..." : "Save Advice"}
              </button>
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