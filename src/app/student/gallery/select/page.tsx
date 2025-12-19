'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase'; 
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

export default function GallerySelect() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => setLoading(false));
    return () => unsub();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black italic text-slate-200 animate-pulse uppercase tracking-widest">
      Loading Gallery...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <header className="max-w-md mx-auto mb-10">
        {/* 🚀 戻り先を /student に修正 */}
        <Link href="/student" className="text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity">
          ← Back to Panel
        </Link>
        <h1 className="text-4xl font-black italic mt-4 tracking-tighter text-slate-800">GALLERY</h1>
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">作品を見る課題を選んでね</p>
      </header>

      <div className="max-w-md mx-auto space-y-4 pb-20">
        {tasks.map(task => (
          <Link 
            key={task.id} 
            // 🚀 遷移先を /student/gallery/list (あるいは詳細画面のURL) に合わせる
            // ここでは詳細画面を gallery/view.tsx などにする想定で修正
            href={`/student/gallery/list?taskId=${task.id}&title=${encodeURIComponent(task.title)}`}
            className="group block bg-white p-8 rounded-[40px] border-4 border-white shadow-sm active:scale-[0.98] hover:border-indigo-100 hover:shadow-xl transition-all relative overflow-hidden"
          >
            {/* 🚀 ここがポイント：単元名をラベルとして表示 */}
            {task.unitName && (
              <span className="inline-block bg-indigo-50 text-indigo-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3">
                {task.unitName}
              </span>
            )}
            
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                {task.title}
              </h2>
              <span className="text-indigo-200 group-hover:text-indigo-500 transition-colors font-black text-xl">→</span>
            </div>
            
            <p className="text-[9px] font-black text-slate-300 mt-2 uppercase tracking-tighter">Tap to view works</p>
            
            {/* 装飾用の背景ロゴ */}
            <span className="absolute -right-4 -bottom-4 text-6xl opacity-[0.03] font-black italic group-hover:opacity-[0.05] transition-opacity">
              ART
            </span>
          </Link>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-[40px]">
            <p className="font-black italic text-slate-300 uppercase">No tasks available.</p>
          </div>
        )}
      </div>
    </div>
  );
}