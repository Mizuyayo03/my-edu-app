'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase'; // dbを追加
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore'; // 機能追加
import Link from 'next/link';
import { IoCopyOutline } from 'react-icons/io5'; // アイコン追加

export default function TeacherStartPage() {
  const [user, setUser] = useState<any>(null);
  // --- ここから追加機能のステート ---
  const [classes, setClasses] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  // --- ここまで ---

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // クラス一覧をリアルタイム取得する機能を追加
        const q = query(collection(db, "classes"), where("teacherId", "==", u.uid));
        const unsub = onSnapshot(q, (snap) => {
          setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
      }
    });
  }, []);

  // クラス作成処理を追加
  const handleCreateClass = async () => {
    if (!newClassName || !user) return;
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await addDoc(collection(db, "classes"), {
        className: newClassName,
        classCode: generatedCode,
        teacherId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewClassName('');
      setShowCreateModal(false);
    } catch (err) {
      alert("作成に失敗しました");
    }
  };

  if (!user) return <div className="p-20 text-center font-bold text-slate-400">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col">
      {/* ナビゲーション：元のまま */}
      <nav className="p-6 px-10 flex justify-between items-center bg-white shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-black italic tracking-tighter text-slate-800">TEACHER PANEL</h1>
        
        <div className="flex items-center gap-4">
          {/* hrefを削除し、onClickでポップアップを開くように変更（見た目はそのまま） */}
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-md"
          >
            ＋ Create Class
          </button>
          <button onClick={() => signOut(auth)} className="text-slate-300 font-bold text-[10px] hover:text-rose-500 uppercase tracking-widest">Logout</button>
        </div>
      </nav>

      {/* メイン：元の3大機能パネルをそのまま維持 */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        
        {/* 1. 提出確認機能 (CHECK) */}
        <Link href="/teacher/check" className="w-full group bg-slate-900 p-10 rounded-[40px] shadow-xl hover:shadow-2xl hover:bg-indigo-700 transition-all flex flex-col items-center justify-center text-center text-white">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📁</span>
          <span className="text-2xl font-black italic tracking-tighter">CHECK BOX</span>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-2">提出確認機能</p>
        </Link>

        {/* 2. 共有機能 (GALLERY) */}
        <Link href="/teacher/gallery-select" className="w-full group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-slate-100 transition-all flex flex-col items-center justify-center text-center">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎨</span>
          <span className="text-2xl font-black italic tracking-tighter text-slate-800">GALLERY</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">共有機能</p>
        </Link>

        {/* 3. 総覧機能 (SUMMARY) */}
        <Link href="/teacher/summary-select" className="w-full group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-slate-100 transition-all flex flex-col items-center justify-center text-center">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</span>
          <span className="text-2xl font-black italic tracking-tighter text-slate-800">SUMMARY</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">総覧機能</p>
        </Link>

        {/* --- ここから：クラスコード表示エリアを「追加」 --- */}
        {classes.length > 0 && (
          <div className="w-full mt-10 p-6 bg-white rounded-[32px] shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Created Classes & Codes</p>
            <div className="space-y-3">
              {classes.map((cls) => (
                <div key={cls.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-600">{cls.className}</p>
                    <p className="text-lg font-black tracking-widest text-slate-800">{cls.classCode}</p>
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(cls.classCode); alert("コピーしました！"); }}
                    className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                  >
                    <IoCopyOutline />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* --- ここから：ポップアップ画面を「追加」 --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-6 uppercase italic text-center">New Class</h2>
            <input 
              type="text" 
              placeholder="クラス名 (例: 1年1組)"
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 mb-6 font-bold text-slate-900 outline-none focus:border-indigo-600"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
              <button onClick={handleCreateClass} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black italic shadow-lg">CREATE</button>
            </div>
          </div>
        </div>
      )}

      {/* フッター：元のまま */}
      <footer className="p-10 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Academic Management System</p>
      </footer>
    </div>
  );
}