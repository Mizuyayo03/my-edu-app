'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateTask() {
  const [title, setTitle] = useState('');
  const [unitName, setUnitName] = useState('');
  const [deadline, setDeadline] = useState('');
  const [classId, setClassId] = useState(''); // 🚀 追加：選択されたクラスID
  const [classes, setClasses] = useState<any[]>([]); // 🚀 追加：クラス一覧
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🚀 クラス一覧を取得
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "classes"), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline || !unitName || !classId) return alert("すべての項目を入力してください");
    
    setLoading(true);
    try {
      await addDoc(collection(db, "tasks"), {
        title,
        unitName,
        classId, // 🚀 これで課題とクラスが紐付く
        deadline: new Date(deadline),
        createdAt: serverTimestamp(),
      });
      router.push('/teacher/check');
    } catch (error) {
      alert("作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <header className="max-w-md mx-auto mb-10 flex justify-between items-center">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">New Task</h1>
        <Link href="/teacher/check" className="text-xs font-bold bg-white px-4 py-2 rounded-xl border shadow-sm uppercase tracking-widest text-slate-400">Cancel</Link>
      </header>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        {/* 🚀 クラス選択を追加 */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 tracking-[0.2em]">Select Class</label>
          <select 
            value={classId} 
            onChange={(e) => setClassId(e.target.value)}
            className="w-full p-6 bg-white rounded-[32px] font-black text-lg border-none shadow-sm focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="">クラスを選択してください</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* 単元名入力 */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 tracking-[0.2em]">Unit Name</label>
          <input type="text" placeholder="例：鉛筆デッサン基礎" value={unitName} onChange={(e) => setUnitName(e.target.value)} className="w-full p-6 bg-white rounded-[32px] font-black text-lg border-none shadow-sm focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* 課題名入力 */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Task Title</label>
          <input type="text" placeholder="例：第1回 構成と下書き" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-6 bg-white rounded-[32px] font-black text-xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500" />
        </div>

        {/* 期限入力 */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Deadline</label>
          <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full p-6 bg-white rounded-[32px] font-bold text-lg border-none shadow-sm focus:ring-2 focus:ring-indigo-500" />
        </div>

        <button type="submit" disabled={loading} className="w-full py-7 bg-slate-900 text-white rounded-[40px] font-black italic text-2xl shadow-2xl active:scale-[0.98] disabled:bg-slate-300 transition-all mt-4">
          {loading ? "CREATING..." : "CREATE"}
        </button>
      </form>
    </div>
  );
}