'use client';
 
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  query,     // 🚀 追加
  where      // 🚀 追加
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoPeopleOutline, IoTrashOutline } from 'react-icons/io5';
 
export default function TeacherStartPage() {
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
 
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        
        // 🚀 修正完了: 自分のUID (teacherId) に一致するものだけを取得するように変更
        const q = query(
          collection(db, "classes"),
          where("teacherId", "==", u.uid)
        );

        const unsubSnapshot = onSnapshot(q, (snap) => {
          setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
        return () => unsubSnapshot();
      } else {
        setUser(null);
        setLoading(false);
        router.push('/teacher/login');
      }
    });
    return () => unsub();
  }, [router]);
 
  // --- クラス作成機能 ---
  const handleCreateClass = async () => {
    if (!newClassName || !user) return;
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      await addDoc(collection(db, "classes"), {
        className: newClassName,
        classCode: generatedCode,
        teacherId: user.uid, // ログイン中の先生のIDを保存
        createdAt: serverTimestamp(),
      });
      setNewClassName('');
      setShowCreateModal(false);
    } catch (err) {
      alert("作成に失敗しました");
    }
  };
 
  // --- クラス削除機能 ---
  const handleDeleteClass = async (classId: string, className: string) => {
    if (!window.confirm(`「${className}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) return;
    try {
      await deleteDoc(doc(db, "classes", classId));
    } catch (err) {
      alert("削除に失敗しました");
    }
  };
 
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-6">
        <div className="text-center font-bold text-slate-400 font-black italic uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 flex flex-col">
      <nav className="p-6 px-10 flex justify-between items-center bg-white shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-black italic tracking-tighter text-slate-800">先生用画面</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-md"
          >
            ＋ クラスルーム作成
          </button>
          <button onClick={() => signOut(auth)} className="text-slate-300 font-bold text-[10px] hover:text-rose-500 uppercase tracking-widest transition-colors">ログアウト</button>
        </div>
      </nav>
 
      <main className="flex-1 flex flex-col items-center justify-start p-6 gap-6 max-w-md mx-auto w-full pt-10">
        <Link href="/teacher/check" className="w-full group bg-slate-900 p-10 rounded-[40px] shadow-xl hover:shadow-2xl hover:bg-indigo-700 transition-all flex flex-col items-center justify-center text-center text-white">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📁</span>
          <span className="text-2xl font-black italic tracking-tighter">提出確認機能</span>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-2">CHECK BOX</p>
        </Link>
 
        <Link href="/teacher/gallery-select" className="w-full group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-slate-100 transition-all flex flex-col items-center justify-center text-center">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎨</span>
          <span className="text-2xl font-black italic tracking-tighter text-slate-800">共有機能</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">GALLERY</p>
        </Link>
 
        <Link href="/teacher/summary-select" className="w-full group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-slate-100 transition-all flex flex-col items-center justify-center text-center">
          <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</span>
          <span className="text-2xl font-black italic tracking-tighter text-slate-800">総覧機能</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">SUMMARY</p>
        </Link>
 
        {/* クラス管理エリア */}
        {classes.length > 0 && (
          <div className="w-full mt-10 p-6 bg-white rounded-[32px] shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">管理中のクラス一覧</p>
            <div className="space-y-4">
              {classes.map((cls) => (
                <div key={cls.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all group/item">
                  <div className="flex flex-col">
                    <p className="text-lg font-black tracking-tight text-slate-800">{cls.className}</p>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(cls.classCode); alert("クラスコードをコピーしました！"); }}
                      className="text-left text-[9px] font-bold text-slate-300 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                    >
                      Copy Class Code
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/teacher/class/${cls.id}?name=${encodeURIComponent(cls.className)}`}
                      className="bg-white text-slate-400 p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-1.5 font-black text-[9px] uppercase tracking-tighter"
                    >
                      <IoPeopleOutline className="text-base" /> Students
                    </Link>
                    <button
                      onClick={() => handleDeleteClass(cls.id, cls.className)}
                      className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      title="このクラスを削除"
                    >
                      <IoTrashOutline className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
 
      {/* クラス作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-sm shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-6 uppercase italic text-center tracking-tighter">クラス作成</h2>
            <input
              type="text"
              placeholder="クラス名 (例: 1年1組)"
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 mb-6 font-bold text-slate-900 outline-none focus:border-indigo-600 transition-colors"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">キャンセル</button>
              <button onClick={handleCreateClass} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black italic shadow-lg hover:bg-indigo-600 transition-all">作成する</button>
            </div>
          </div>
        </div>
      )}
 
      <footer className="p-10 text-center mt-auto">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Academic Management System</p>
      </footer>
    </div>
  );
}