'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
  const title = searchParams.get('title');
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "works"), where("taskId", "==", taskId));
    
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      
      // 出席番号で並び替え（番号がない人は後ろへ）
      data.sort((a: any, b: any) => (parseInt(a.studentNumber) || 999) - (parseInt(b.studentNumber) || 999));
      
      setWorks(data);
      setLoading(false);
    }, (err) => {
      console.error("Firebase Error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [taskId]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 animate-pulse uppercase tracking-widest">
      ギャラリーを読み込み中...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <header className="max-w-2xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href="/student" className="text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-3 block hover:opacity-70 transition-opacity">
            ← パネルに戻る
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase mb-1">Task Gallery</span>
            <h1 className="text-3xl font-black tracking-tighter text-slate-800">
              {title || "みんなの作品"}
            </h1>
          </div>
        </div>
        <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {works.length} 作品
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {works.length === 0 ? (
          <div className="bg-white rounded-[48px] p-24 text-center border-4 border-dashed border-slate-100">
            <p className="text-slate-300 font-black uppercase tracking-widest">まだ投稿がありません。</p>
          </div>
        ) : (
          works.map((work) => {
            const isExpanded = expandedId === work.id;
            return (
              <div 
                key={work.id} 
                onClick={() => setExpandedId(isExpanded ? null : work.id)}
                className={`bg-white rounded-[40px] p-6 shadow-sm border-4 transition-all cursor-pointer ${isExpanded ? 'border-indigo-500 -translate-y-1 shadow-xl' : 'border-white hover:border-slate-100'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic text-sm shadow-lg">
                      {work.studentNumber || "??"}
                    </span>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">作成者</p>
                      <p className="text-lg font-black text-slate-800">{work.studentName}</p>
                    </div>
                  </div>
                  {!isExpanded && (
                    <div className="relative">
                      <img 
                        src={work.images ? work.images[0] : work.image} 
                        className="w-16 h-16 object-cover rounded-[20px] border-2 border-slate-50 shadow-sm" 
                        alt="preview"
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-8 pt-8 border-t-2 border-slate-50 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 gap-6 mb-8">
                      {work.images ? work.images.map((img:string, i:number) => (
                        <div key={i} className="relative group">
                          <img 
                            src={img} 
                            style={{ filter: `brightness(${work.brightness || 100}%)` }}
                            className="w-full rounded-[32px] border-4 border-slate-50 shadow-inner" 
                            alt="work"
                          />
                        </div>
                      )) : (
                        <img src={work.image} className="w-full rounded-[32px] border-4 border-slate-50 shadow-inner" alt="work" />
                      )}
                    </div>
                    
                    <div className="bg-indigo-50 p-8 rounded-[32px] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 italic">Message</p>
                      <p className="text-base font-bold text-indigo-900 leading-relaxed transition-all">
                        {work.comment ? `“ ${work.comment} ”` : "コメントはありません。"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}