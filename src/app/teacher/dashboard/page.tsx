'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { IoFolderOpenOutline, IoTimeOutline, IoCheckmarkDone } from 'react-icons/io5';

export default function TeacherStartPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 課題を新しい順に取得
    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="p-10 font-black text-slate-300 animate-pulse">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <header className="max-w-4xl mx-auto mb-10">
        <h1 className="text-3xl font-black italic tracking-tighter text-slate-800 uppercase">Teacher Admin</h1>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">課題管理・提出確認</p>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {tasks.map((task) => (
          <Link 
            key={task.id} 
            href={`/teacher/check/task/${task.id}`} // ここで課題IDを次の画面に渡す
            className="block bg-white p-6 rounded-[32px] border-4 border-white hover:border-indigo-500 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                  <IoFolderOpenOutline size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{task.title}</h2>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                      <IoTimeOutline /> 期限: {task.deadline || "なし"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest group-hover:bg-indigo-600 transition-colors">
                提出箱を開く →
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}