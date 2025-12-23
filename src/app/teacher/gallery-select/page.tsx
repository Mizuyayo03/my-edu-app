'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { IoImagesOutline, IoArrowBackOutline, IoChevronForwardOutline, IoSchoolOutline } from 'react-icons/io5';

export default function GallerySelectPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 🚀 ログイン中の先生が作成したクラス一覧をリアルタイムで取得
        const q = query(collection(db, "classes"), where("teacherId", "==", user.uid));
        const unsubDocs = onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setClasses(data);
          setLoading(false);
        });
        return () => unsubDocs();
      } else {
        router.push('/teacher/login');
      }
    });
    return () => unsubAuth();
  }, [router]);

  if (loading) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">Loading Classes...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 font-sans text-slate-900">
      <header className="max-w-4xl mx-auto mb-10 flex items-center gap-6">
        <button 
          onClick={() => router.push('/teacher')} 
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-900 hover:text-white transition-all text-2xl"
        >
          <IoArrowBackOutline />
        </button>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800">Gallery Select</h1>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">表示するクラスを選択してください</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {classes.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border-4 border-dashed border-slate-200">
            <p className="font-black text-slate-300 italic uppercase tracking-widest">クラスが見つかりません</p>
            <button 
              onClick={() => router.push('/teacher')} 
              className="mt-6 text-indigo-500 font-black text-xs underline underline-offset-4"
            >
              新しくクラスを作成する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => router.push(`/teacher/gallery/${cls.id}?name=${cls.className}`)}
                className="group bg-white p-8 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-indigo-500 border-4 border-transparent transition-all text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <IoSchoolOutline />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tight">{cls.className}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">View Gallery</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                  <IoChevronForwardOutline className="text-xl" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <footer className="max-w-4xl mx-auto mt-20 text-center opacity-20">
        <IoImagesOutline className="text-4xl mx-auto mb-2" />
        <p className="text-[8px] font-black uppercase tracking-[0.5em]">Class Gallery Management System</p>
      </footer>
    </div>
  );
}