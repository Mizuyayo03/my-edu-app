'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../../../firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function Overview() {
  const params = useParams();
  const taskId = params?.id as string;
  // 🚀 型エラーを防ぐために any[] で定義
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚀 【重要】taskId がない時は実行しない（FirebaseError対策）
    if (!taskId) return;

    const q = query(
      collection(db, "works"), 
      where("taskId", "==", taskId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      }));
      
      // 🚀 出席番号順にソート（Numberで数値化）
      data.sort((a: any, b: any) => 
        Number(a.studentNumber || 999) - Number(b.studentNumber || 999)
      );
      
      setWorks(data);
      setLoading(false);
    });

    return () => unsub();
  }, [taskId]);

  if (loading || !taskId) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-200 italic text-2xl uppercase tracking-[0.3em]">
      Loading Gallery...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* 🚀 【重要】詳細画面に戻るためのボタン */}
          <Link 
            href={`/teacher/check/${taskId}`} 
            className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all border border-slate-100 group"
          >
            <span className="text-2xl font-black text-slate-300 group-hover:text-indigo-600">←</span>
          </Link>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">Gallery Overview</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">全作品タイル表示</p>
          </div>
        </div>
        <div className="bg-slate-900 text-white px-8 py-4 rounded-[24px] font-black text-sm shadow-xl">
          {works.length} SUBMISSIONS
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {works.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300 font-black italic uppercase">No works found.</div>
        ) : (
          works.map((work) => (
            <div key={work.id} className="aspect-[3/4] bg-white rounded-2xl overflow-hidden shadow-sm border border-white hover:scale-105 transition-all duration-300 group relative">
              <img 
                src={work.images?.[0]} 
                className="w-full h-full object-cover"
                style={{ filter: `brightness(${work.brightness || 100}%)` }}
              />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <p className="text-[10px] font-black text-white truncate leading-tight">
                  {work.studentNumber}. {work.studentName || "Anon"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}