'use client';

import React, { useState, useEffect, Suspense } from 'react';
// ↓ ここの「../」の数は、フォルダの深さに合わせる必要があります
// もしエラーが出る場合は、一度消して「../../」と打つとVSCodeが候補を出してくれます
import { db, auth } from '../../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoChevronBack, IoShapesOutline } from 'react-icons/io5';

// --- 型定義 ---
interface Work {
  id: string;
  studentName: string;
  studentNumber: string;
  images: string[];
  taskName: string;
  comment: string;
  brightness: number;
  createdAt: any;
}

function GalleryContent() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push('/student/login');
        return;
      }
      setUser(u);
    });

    // classIdがない場合は、エラーにせず「読み込み終了」にする
    if (!classId) {
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, "works"),
        where("classId", "==", classId),
        orderBy("createdAt", "desc")
      );

      const unsubSnap = onSnapshot(q, (snap) => {
        const fetchedWorks = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Work));
        setWorks(fetchedWorks);
        setLoading(false);
      }, (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      });

      return () => {
        unsubAuth();
        unsubSnap();
      };
    } catch (e) {
      console.error("Query building error:", e);
      setLoading(false);
    }
  }, [classId, router]);

  if (loading) return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <nav className="p-6 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 flex justify-between items-center">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1 text-xs font-black text-slate-400 uppercase tracking-tighter hover:text-indigo-600 transition-colors"
        >
          <IoChevronBack /> Back
        </button>
        <h1 className="text-xl font-black italic tracking-tighter text-indigo-600">GALLERY</h1>
        <div className="w-10" />
      </nav>

      <main className="p-6 max-w-5xl mx-auto">
        {works.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <IoShapesOutline className="text-6xl mb-4 opacity-20" />
            <p className="font-black italic uppercase tracking-widest text-lg">No works yet</p>
            <p className="text-[10px] font-bold mt-2 uppercase">作品がまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {works.map((work) => (
              <div key={work.id} className="group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-slate-100">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
                  {work.images && work.images[0] ? (
                    <img 
                      src={work.images[0]} 
                      alt="work"
                      style={{ filter: `brightness(${(work.brightness || 1) * 100}%)` }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px] font-black italic">NO IMAGE</div>
                  )}
                  {work.images && work.images.length > 1 && (
                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur text-slate-900 px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
                      +{work.images.length - 1}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-2">
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
                      {work.taskName || "Untitled Task"}
                    </p>
                    <h3 className="text-lg font-black text-slate-800 italic leading-tight">
                      {work.studentName}
                      <span className="text-[10px] text-slate-300 ml-2 not-italic">#{work.studentNumber}</span>
                    </h3>
                  </div>
                  {work.comment && (
                    <p className="mt-3 text-[11px] font-bold text-slate-400 line-clamp-2 leading-relaxed bg-slate-50 p-3 rounded-2xl">
                      {work.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-indigo-50 flex items-center justify-center font-black text-slate-400">LOADING...</div>}>
      <GalleryContent />
    </Suspense>
  );
}