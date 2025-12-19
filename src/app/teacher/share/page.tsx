'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ShareView() {
  const params = useParams();
  const taskId = params?.id as string;
  const [works, setWorks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!taskId) return;
    const q = query(collection(db, "works"), where("taskId", "==", taskId));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWorks(data);
    });
  }, [taskId]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % works.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + works.length) % works.length);

  if (works.length === 0) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black italic uppercase tracking-widest text-2xl">No Submissions</div>;

  const currentWork = works[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      <header className="p-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <Link href={`/teacher/check/${taskId}`} className="text-slate-400 font-black hover:text-white transition-colors">← CLOSE</Link>
        <div className="text-center">
          <p className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Share Mode</p>
          <h1 className="text-xl font-black italic tracking-tighter uppercase">{currentIndex + 1} / {works.length}</h1>
        </div>
        <div className="w-20"></div>
      </header>

      <main className="flex-1 flex items-center justify-center p-10 relative">
        <button onClick={prev} className="absolute left-10 z-10 w-20 h-20 bg-white/5 hover:bg-white/10 rounded-full text-4xl font-black transition-all">‹</button>
        
        <div className="max-w-4xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
          <img 
            src={currentWork.images?.[0]} 
            className="max-h-[70vh] object-contain rounded-[40px] shadow-2xl border-4 border-white/5"
            style={{ filter: `brightness(${currentWork.brightness || 100}%)` }}
          />
          <div className="mt-8 text-center">
            <p className="text-4xl font-black italic tracking-tighter mb-4">{currentWork.studentName || "Anonymous"}</p>
            <p className="text-xl text-slate-400 font-medium max-w-2xl">{currentWork.comment}</p>
          </div>
        </div>

        <button onClick={next} className="absolute right-10 z-10 w-20 h-20 bg-white/5 hover:bg-white/10 rounded-full text-4xl font-black transition-all">›</button>
      </main>
    </div>
  );
}