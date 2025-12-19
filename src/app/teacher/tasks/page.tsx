'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { db, auth } from '../../../firebase/firebase';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TasksContent() {
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');
  const classCode = searchParams.get('code');
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');

  // 課題箱の取得
  useEffect(() => {
    if (classCode) {
      const q = query(collection(db, "tasks"), where("classCode", "==", classCode));
      const unsub = onSnapshot(q, (snap) => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [classCode]);

  // 新しい課題箱を作る
  const createTask = async () => {
    if (!title || !deadline) return alert("入力してね");
    await addDoc(collection(db, "tasks"), {
      title,
      deadline,
      classCode,
      teacherId: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
    });
    setTitle('');
    setDeadline('');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <button onClick={() => window.history.back()} className="text-slate-400 font-black text-[10px] mb-4 uppercase tracking-widest">← Back</button>
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900">TASK BOX</h1>
        </header>

        {/* 新しい課題箱を作る：スクショのデザインを再現 */}
        <section className="bg-white p-10 rounded-[50px] shadow-xl shadow-slate-200/50 border border-slate-100 mb-12">
          <h2 className="text-indigo-600 font-black text-lg mb-8 ml-2">新しい課題箱を作る</h2>
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-3xl">
              <input 
                type="text" 
                placeholder="課題名（例：自画像）" 
                className="w-full bg-transparent outline-none text-xl font-bold text-slate-700 placeholder:text-slate-300"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">提出期限</span>
              <input 
                type="date" 
                className="bg-transparent outline-none font-bold text-slate-700"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <button 
              onClick={createTask}
              className="w-full bg-indigo-600 text-white py-6 rounded-[30px] font-black text-xl shadow-lg shadow-indigo-200 active:scale-[0.98] transition-all"
            >
              課題箱を設置する
            </button>
          </div>
        </section>

        {/* 設置済みの課題箱：ボタンのリンク先を修正 */}
        <section>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 ml-4">設置済みの課題箱</p>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-50 flex justify-between items-center group hover:border-indigo-100 transition-all">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-1">{task.title}</h3>
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider">DEADLINE: {task.deadline}</p>
                </div>
                
                {/* 🚀 【重要】ここが移動を解決するボタンです */}
                <Link 
                  href={`/teacher/check/detail?taskId=${task.id}&title=${encodeURIComponent(task.title)}`}
                  className="bg-slate-50 text-slate-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  提出を確認
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function TeacherTasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksContent />
    </Suspense>
  );
}