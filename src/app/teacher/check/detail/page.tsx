'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { db } from '../../../../firebase/firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';

function TaskDetailContent() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
  const title = searchParams.get('title');
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null); // 展開中のカードID
  const router = useRouter();

  useEffect(() => {
    if (!taskId) return;
    const q = query(collection(db, "works"), where("taskId", "==", taskId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const sorted = data.sort((a, b) => parseInt(a.attendanceNumber || "999") - parseInt(b.attendanceNumber || "999"));
      setWorks(sorted);
      setLoading(false);
    });
    return () => unsub();
  }, [taskId]);

  if (loading) return <div className="p-20 text-center font-black text-slate-300 italic">LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <header className="max-w-4xl mx-auto mb-8 flex justify-between items-end">
        <div>
          <button onClick={() => router.push('/teacher/check')} className="text-slate-400 font-bold text-[10px] uppercase mb-2">← BACK</button>
          <h1 className="text-3xl font-black italic border-l-8 border-indigo-600 pl-4">{title}</h1>
        </div>
        <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border font-black">{works.length} 名</div>
      </header>

      <div className="max-w-4xl mx-auto space-y-4">
        {works.map((work) => {
          const isExpanded = expandedId === work.id;
          // 表示する画像を取得（最初の1枚か、全部か）
          const displayImages = isExpanded 
            ? (work.images || [work.image]) 
            : [(work.images?.[0] || work.image)];

          return (
            <div 
              key={work.id} 
              onClick={() => setExpandedId(isExpanded ? null : work.id)}
              className={`bg-white rounded-[32px] p-6 shadow-sm border transition-all cursor-pointer ${isExpanded ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-slate-100 hover:border-slate-300'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="bg-slate-900 text-white px-4 py-1 rounded-full font-mono font-black text-xs">NO.{work.attendanceNumber || "??"}</span>
                  {!isExpanded && <span className="text-[10px] font-bold text-slate-400">タップして詳細を表示</span>}
                </div>
                {work.images?.length > 1 && !isExpanded && (
                  <span className="text-[10px] font-black bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full">他 {work.images.length - 1} 枚</span>
                )}
              </div>

              {/* 画像表示エリア */}
              <div className={`grid gap-4 ${isExpanded ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {displayImages.map((img: string, i: number) => (
                  <div key={i} className={`${isExpanded ? 'aspect-[4/3]' : 'h-32 w-48'} bg-slate-100 rounded-2xl overflow-hidden border`}>
                    <img src={img} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>

              {/* 展開時のみコメントを表示 */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-widest">Comment</p>
                  <p className="text-sm font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">{work.comment || "コメントなし"}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() { return <Suspense><TaskDetailContent /></Suspense>; }