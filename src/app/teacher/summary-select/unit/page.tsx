'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { IoArrowBack, IoLayersOutline } from 'react-icons/io5';

export default function UnitSummaryPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qTasks = query(collection(db, "tasks"), orderBy("createdAt", "asc"));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qWorks = query(collection(db, "works"), orderBy("createdAt", "desc"));
    const unsubWorks = onSnapshot(qWorks, (snap) => {
      setWorks(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setLoading(false);
    });

    return () => { unsubTasks(); unsubWorks(); };
  }, []);

  // 1. 単元(unitName)ごとに課題をグループ化する
  const unitNames = Array.from(new Set(tasks.map(t => t.unitName).filter(Boolean)));

  if (loading) return <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center font-black text-slate-200 italic text-2xl animate-pulse uppercase tracking-[0.3em]">Loading Unit Data...</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8 font-sans text-slate-900">
      <header className="max-w-[1600px] mx-auto mb-16 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/teacher/summary-select" className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-xl shadow-slate-200/50 hover:scale-105 transition-all border border-white group">
            <span className="text-3xl font-black text-slate-200 group-hover:text-purple-600 transition-colors">←</span>
          </Link>
          <div>
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.5em] mb-1">Unit Archive</p>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-slate-800">Unit Summary</h1>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto space-y-32">
        {unitNames.map(unit => {
          // この単元に属する課題（第1回、第2回...）を抽出
          const unitTasks = tasks.filter(t => t.unitName === unit);
          
          return (
            <section key={unit as string} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-baseline gap-6 mb-12 ml-4">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Target Unit</span>
                   <h2 className="text-5xl font-black text-slate-800 italic uppercase tracking-tighter"># {unit as string}</h2>
                </div>
                <div className="h-[2px] flex-1 bg-slate-200 opacity-50"></div>
              </div>
              
              {/* 🚀 実用ポイント：課題（第1回〜）を横に並べるスクロールエリア */}
              <div className="flex gap-10 overflow-x-auto pb-10 px-4 scrollbar-hide">
                {unitTasks.map(task => {
                  const taskWorks = works.filter(w => w.taskId === task.id);
                  return (
                    <div key={task.id} className="flex-shrink-0 w-[320px]">
                      <div className="flex items-center gap-3 mb-6 bg-white/50 w-fit px-4 py-2 rounded-full border border-white">
                        <IoLayersOutline className="text-purple-500" />
                        <span className="font-black text-slate-600 text-sm uppercase tracking-tighter">{task.title}</span>
                        <span className="bg-purple-100 text-purple-600 text-[10px] font-black px-2 py-0.5 rounded-md">{taskWorks.length}</span>
                      </div>

                      <div className="space-y-4">
                        {taskWorks.map(work => (
                          <div key={work.id} className="group relative aspect-[4/3] bg-white rounded-[32px] overflow-hidden shadow-lg shadow-slate-200/60 border-[6px] border-white transition-all hover:scale-[1.03]">
                            <img 
                              src={work.images?.[0]} 
                              className="w-full h-full object-cover"
                              style={{ filter: `brightness(${work.brightness || 100}%)` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                              <p className="text-[10px] font-black text-purple-300 uppercase mb-1">No.{work.studentNumber}</p>
                              <p className="text-md font-black text-white">{work.studentName}</p>
                            </div>
                          </div>
                        ))}
                        {taskWorks.length === 0 && (
                          <div className="aspect-[4/3] rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest">No Submissions</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}