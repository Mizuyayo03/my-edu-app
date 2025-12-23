'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // 🚀 setDocをここに移動
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoLogOutOutline, IoEnterOutline, IoCameraOutline, IoShareSocialOutline, IoTimeOutline } from 'react-icons/io5';

export default function StudentStartPage() {
  const [user, setUser] = useState<any>(null);
  const [classCode, setClassCode] = useState('');
  const [joinedClass, setJoinedClass] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        
        // 🚀 Googleのメールアドレスを使って、先生が登録したクラス情報を取得
        if (u.email) {
          try {
            const userDoc = await getDoc(doc(db, "users", u.email));
            if (userDoc.exists()) {
              // 先生がエクセルで入れた classId を取得して反映
              setJoinedClass(userDoc.data().classId || null);
            }
          } catch (err) {
            console.error("データ取得失敗:", err);
          }
        }
      } else {
        router.push('/student/login');
      }
    });
    return () => unsub();
  }, [router]);

  // クラス参加処理（手動用）
  const handleJoinClass = async () => {
    if (!classCode || !user || !user.email) return;
    try {
      // 🚀 エラーの原因だった書き方を修正
      await setDoc(doc(db, "users", user.email), {
        classId: classCode.toUpperCase()
      }, { merge: true });
      
      setJoinedClass(classCode.toUpperCase());
      setShowJoinModal(false);
      alert(`クラス ${classCode.toUpperCase()} に参加しました！`);
    } catch (err) {
      alert("参加に失敗しました。");
    }
  };

  if (!user) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-900 flex flex-col font-sans">
      {/* ナビゲーション */}
      <nav className="p-6 px-10 flex justify-between items-center bg-white shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-black italic tracking-tighter text-indigo-600">STUDENT PANEL</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowJoinModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-colors shadow-md flex items-center gap-1"
          >
            <IoEnterOutline className="w-3 h-3" /> {joinedClass ? joinedClass : 'Join Class'}
          </button>
          <button onClick={() => signOut(auth)} className="text-slate-300 font-bold text-[10px] hover:text-rose-500 uppercase tracking-widest">Logout</button>
        </div>
      </nav>

      {/* メインパネル */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <Link href="/student/upload" className="w-full group bg-indigo-600 p-10 rounded-[40px] shadow-xl hover:shadow-2xl hover:bg-indigo-700 transition-all flex flex-col items-center justify-center text-center text-white">
          <IoCameraOutline className="text-5xl mb-4 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter uppercase">Take Photo</span>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-2">作品を撮る機能</p>
        </Link>

        <Link href="/student/share" className="w-full group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-white hover:border-indigo-100 transition-all flex flex-col items-center justify-center text-center">
          <IoShareSocialOutline className="text-5xl mb-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">Share Gallery</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">共有機能</p>
        </Link>

        <Link href="/student/history" className="w-full group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-white hover:border-indigo-100 transition-all flex flex-col items-center justify-center text-center">
          <IoTimeOutline className="text-5xl mb-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">My History</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">振り返り機能</p>
        </Link>
      </main>

      {/* クラス参加モーダル */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-white p-8 rounded-[40px] w-full max-w-sm shadow-2xl text-center border-t-8 border-indigo-600">
            <h2 className="text-xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter">Class Code</h2>
            <input 
              type="text" 
              placeholder="ABC123"
              className="w-full p-4 bg-indigo-50 rounded-2xl border-none mb-6 font-black text-center text-2xl tracking-[0.3em] text-indigo-600 outline-none"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
            />
            <div className="flex gap-4">
              <button onClick={() => setShowJoinModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
              <button onClick={handleJoinClass} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black italic shadow-lg">JOIN</button>
            </div>
          </div>
        </div>
      )}

      <footer className="p-10 text-center">
        <p className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.5em]">Academic Management System</p>
      </footer>
    </div>
  );
}