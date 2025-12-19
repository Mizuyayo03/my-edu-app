'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function TeacherCheck() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]); // 🚀 クラス情報を格納
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    // 🚀 クラス一覧を取得
    const unsubClasses = onSnapshot(collection(db, "classes"), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
    const unsubTasks = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));

    return () => {
      unsubClasses();
      unsubTasks();
    };
  }, []);

  // --- (formatDate, handleDelete, startEdit, handleUpdate などの関数はそのまま保持) ---

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "期限なし";
    try {
      if (dateValue instanceof Timestamp) return dateValue.toDate().toLocaleString();
      const d = new Date(dateValue.seconds ? dateValue.seconds * 1000 : dateValue);
      return d.toLocaleString();
    } catch (e) { return "日時エラー"; }
  };

  const handleDelete = async (id: string) => {
    if (!id || !confirm("この課題箱を削除しますか？")) return;
    try { await deleteDoc(doc(db, "tasks", id)); } catch (e) { alert("失敗"); }
  };

  const startEdit = (task: any) => {
    setEditingTask(task);
    setEditTitle(task.title);
    try {
      const d = task.deadline?.toDate ? task.deadline.toDate() : new Date(task.deadline?.seconds * 1000 || task.deadline);
      const formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setEditDeadline(formattedDate);
    } catch (e) { setEditDeadline(""); }
  };

  const handleUpdate = async () => {
    if (!editingTask?.id || !editTitle || !editDeadline) return;
    try {
      await updateDoc(doc(db, "tasks", editingTask.id), { title: editTitle, deadline: new Date(editDeadline) });
      setEditingTask(null);
    } catch (e) { alert("失敗"); }
  };

  // 🚀 グループ化の基準：単元ごとに並べる
  const uniqueUnits = Array.from(new Set(tasks.map(t => t.unitName || "未分類")));

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-black text-slate-200 italic text-2xl animate-pulse uppercase">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 text-slate-900 font-sans">
      <header className="max-w-5xl mx-auto mb-12 flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <Link href="/teacher" className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all border border-slate-100 group">
            <span className="text-2xl font-black text-slate-300 group-hover:text-indigo-600">←</span>
          </Link>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-indigo-600">Check Box</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-1 ml-1">Class & Unit Management</p>
          </div>
        </div>
        <Link href="/teacher/create" className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] text-xs font-black shadow-lg shadow-indigo-100 uppercase tracking-widest hover:bg-indigo-700 transition-all">+ New Task</Link>
      </header>

      <div className="max-w-5xl mx-auto space-y-16">
        {uniqueUnits.map(unit => (
          <section key={unit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6 ml-4">
              <div className="h-2 w-2 bg-indigo-500 rounded-full" />
              <h2 className="text-xl font-black text-slate-400 italic uppercase tracking-widest"># {unit}</h2>
            </div>

            <div className="grid gap-6">
              {tasks.filter(t => (t.unitName || "未分類") === unit).map(task => {
                // 🚀 クラスIDからクラス名を特定
                const targetClass = classes.find(c => c.id === task.classId);
                
                return (
                  <div key={task.id} className="bg-white p-8 rounded-[48px] shadow-sm border border-slate-50 flex justify-between items-center group transition-all hover:shadow-md">
                    <div className="pl-4">
                      <div className="flex items-center gap-3 mb-2">
                        {/* 🚀 クラス名のバッジを表示 */}
                        <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                          {targetClass ? targetClass.name : "Class Unknown"}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800">{task.title}</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                        Until: {formatDate(task.deadline)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(task)} className="px-6 py-4 bg-slate-50 rounded-[20px] text-[10px] font-black text-slate-400 hover:bg-indigo-50 transition-all uppercase">Edit</button>
                      <button onClick={() => handleDelete(task.id)} className="px-6 py-4 bg-red-50 rounded-[20px] text-[10px] font-black text-red-300 hover:bg-red-100 transition-all uppercase">Delete</button>
                      {task.id && (
                        <Link href={`/teacher/check/${task.id}`} className="px-10 py-4 bg-slate-900 text-white rounded-[24px] text-[10px] font-black shadow-xl hover:bg-slate-800 transition-all uppercase tracking-[0.2em]">View Works</Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* モーダル部分はそのまま維持 */}
      {editingTask && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-white w-full max-w-md p-10 rounded-[56px] shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8 text-slate-800">Edit Task</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase ml-4 tracking-widest mb-2 block">Task Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[28px] font-black text-lg border-none focus:ring-0" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase ml-4 tracking-widest mb-2 block">Deadline</label>
                <input type="datetime-local" value={editDeadline} onChange={(e) => setEditDeadline(e.target.value)} className="w-full p-6 bg-slate-50 rounded-[28px] font-bold border-none focus:ring-0" />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={handleUpdate} className="flex-1 py-6 bg-indigo-600 text-white rounded-[28px] font-black text-sm uppercase tracking-widest">Update</button>
              <button onClick={() => setEditingTask(null)} className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-[28px] font-black text-sm uppercase tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}