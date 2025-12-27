'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function TaskDetail() {
  const params = useParams();
  const taskId = params?.id as string;
  
  const [task, setTask] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    // 🚀 taskIdが取得できるまで待機（FirebaseError対策）
    if (!taskId) return;

    // 課題情報の取得
    const getTaskInfo = async () => {
      try {
        const docSnap = await getDoc(doc(db, "tasks", taskId));
        if (docSnap.exists()) setTask(docSnap.data());
      } catch (e) { console.error(e); }
    };

    // 作品一覧の取得
    const q = query(collection(db, "works"), where("taskId", "==", taskId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      // 出席番号順にソート
      data.sort((a, b) => Number(a.studentNumber || 999) - Number(b.studentNumber || 999));
      setWorks(data);
      setLoading(false);
    }, () => setLoading(false));

    getTaskInfo();
    return () => unsub();
  }, [taskId]);

  if (loading || !taskId) return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center font-black text-slate-200 italic text-2xl animate-pulse">
      LOADING...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8 font-sans text-slate-900">
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <div className="flex items-center gap-8">
          {/* 課題一覧（/teacher/check）へ戻る */}
          <Link href="/teacher/check" className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-sm hover:shadow-md transition-all">
            <span className="text-3xl font-black text-slate-200 hover:text-indigo-600">←</span>
          </Link>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2 ml-1">Submissions</p>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
              {task?.title || "DETAIL"}
            </h1>
          </div>
        </div>

      
      </header>

      {/* 作品表示グリッド */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {works.map((work) => (
          <div key={work.id} className="bg-white p-10 rounded-[56px] shadow-sm border border-white flex flex-col group relative">
            <div className="flex gap-4 overflow-x-auto pb-8 snap-x no-scrollbar">
              {work.images?.map((img: string, i: number) => (
                <img 
                  key={i} 
                  src={img} 
                  style={{ filter: `brightness(${work.brightness || 100}%)` }} 
                  onClick={() => setSelectedImg(img)} 
                  className="w-44 h-60 object-cover rounded-[36px] border-4 border-slate-50 shadow-md cursor-zoom-in snap-start flex-shrink-0" 
                />
              ))}
            </div>
            <div className="flex items-center gap-4 mt-auto px-2">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-[22px] flex items-center justify-center font-black text-xl">
                {work.studentNumber}
              </div>
              <p className="text-2xl font-black">{work.studentName || "Anonymous"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 画像拡大モーダル */}
      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/98 z-50 flex items-center justify-center p-8 backdrop-blur-xl animate-in fade-in" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} className="max-w-full max-h-[80vh] object-contain rounded-[48px]" />
        </div>
      )}
    </div>
  );
}