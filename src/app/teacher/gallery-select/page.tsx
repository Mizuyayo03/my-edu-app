'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoCameraOutline, IoImagesOutline, IoCloudUploadOutline, IoChevronBack } from 'react-icons/io5';

export default function GallerySelect() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // ログイン中の先生のクラスだけを取得
        const q = query(collection(db, "classes"), where("teacherId", "==", user.uid));
        const unsub = onSnapshot(q, (snap) => {
          setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
        return () => unsub();
      } else {
        router.push('/teacher/login');
      }
    });
    return () => unsubAuth();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-200 italic text-2xl animate-pulse">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 text-slate-900 font-sans">
      <header className="max-w-4xl mx-auto mb-12 flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <Link href="/teacher" className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all border border-slate-100 group">
            <IoChevronBack size={24} className="text-slate-300 group-hover:text-indigo-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-indigo-600">Share Resources</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-1 ml-1">Sharing with Students</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* 1. クラス選択 */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <label className="text-[10px] font-black text-indigo-400 uppercase ml-4 tracking-[0.2em] block mb-4">Step 1: Select Target Class</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full p-6 bg-slate-50 rounded-[24px] font-black text-lg border-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="">配信先のクラスを選択してください</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.className || c.name}</option>
            ))}
          </select>
        </div>

        {/* 2. 共有方法の選択（クラスが選ばれている時だけアクティブに見せる） */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${!selectedClassId ? 'opacity-30 pointer-events-none' : ''}`}>
          
          {/* A: 撮影して共有 */}
          <button 
            onClick={() => router.push(`/teacher/gallery-select/camera?classId=${selectedClassId}`)}
            className="bg-slate-900 text-white p-10 rounded-[48px] shadow-xl hover:bg-indigo-600 transition-all flex flex-col items-center gap-4 group"
          >
            <IoCameraOutline size={48} className="group-hover:scale-110 transition-transform" />
            <span className="font-black italic text-xl tracking-tighter">撮影して共有</span>
            <p className="text-[8px] font-bold opacity-50 uppercase tracking-widest">Capture Now</p>
          </button>

          {/* B: 生徒作品から共有 */}
          <button 
            onClick={() => router.push(`/teacher/gallery-select/from-students?classId=${selectedClassId}`)}
            className="bg-white text-slate-800 p-10 rounded-[48px] shadow-sm border-2 border-slate-900 hover:bg-slate-50 transition-all flex flex-col items-center gap-4 group"
          >
            <IoImagesOutline size={48} className="group-hover:scale-110 transition-transform" />
            <span className="font-black italic text-xl tracking-tighter">作品から共有</span>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Select Student Work</p>
          </button>

          {/* C: アップロードして共有 */}
          <button 
            onClick={() => router.push(`/teacher/gallery-select/upload?classId=${selectedClassId}`)}
            className="bg-white text-slate-800 p-10 rounded-[48px] shadow-sm border-2 border-slate-100 hover:border-indigo-400 transition-all flex flex-col items-center gap-4 group"
          >
            <IoCloudUploadOutline size={48} className="group-hover:scale-110 transition-transform text-indigo-500" />
            <span className="font-black italic text-xl tracking-tighter">画像を共有</span>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Upload File</p>
          </button>

        </div>

        {!selectedClassId && (
          <p className="text-center text-slate-400 font-bold italic animate-bounce">
            ↑ まずはクラスを選択してください
          </p>
        )}
      </main>

      <footer className="mt-20 text-center">
        <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.5em]">Academic Share System</p>
      </footer>
    </div>
  );
}