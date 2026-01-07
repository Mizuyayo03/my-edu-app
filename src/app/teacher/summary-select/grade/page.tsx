'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../../firebase/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { IoChevronBack, IoPeopleOutline, IoArrowForward } from 'react-icons/io5';

// 型定義
interface ClassData {
  id: string;
  className: string;
  classCode: string;
  teacherId: string;
}

export default function GradeSummaryPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "classes"),
          where("teacherId", "==", user.uid),
          orderBy("className", "asc")
        );

        const unsubClasses = onSnapshot(q, (snap) => {
          setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassData)));
          setLoading(false);
        });
        return () => unsubClasses();
      } else {
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-indigo-300 animate-pulse tracking-widest uppercase">Loading Classes...</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8 md:p-16 font-sans">
      <header className="max-w-5xl mx-auto mb-20 flex items-center gap-10">
        <Link 
          href="/teacher/summary-select" 
          className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-xl hover:scale-105 transition-all border border-white group text-slate-200 hover:text-indigo-600"
        >
          <span className="text-4xl font-black transition-colors">←</span>
        </Link>
        <div>
          <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-2">Grade View</p>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">Select Class</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-4">
        {classes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-slate-200">
            <p className="font-black text-slate-300 uppercase tracking-widest">担当クラスが見つかりません</p>
          </div>
        ) : (
          classes.map((cls: ClassData) => (
            <Link key={cls.id} href={`/teacher/summary-select/grade/display?id=${cls.id}`}>
              <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:bg-indigo-600 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <IoPeopleOutline size={32} />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-800 group-hover:text-white transition-colors block italic tracking-tighter">{cls.className}</span>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-200 transition-colors uppercase tracking-widest">Code: {cls.classCode}</span>
                  </div>
                </div>
                <div className="w-12 h-12 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:translate-x-2 transition-all">
                  <IoArrowForward size={32} />
                </div>
              </div>
            </Link>
          ))
        )}
      </main>
    </div>
  );
}