'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { IoChevronBack, IoLayersOutline, IoArrowForward } from 'react-icons/io5';

export default function UnitSelectionPage() {
  const [units, setUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const q = query(collection(db, "tasks"), where("teacherId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        // 重複しない単元名を取り出す
        const unitNames = new Set<string>();
        querySnapshot.forEach((doc) => {
          if (doc.data().unitName) unitNames.add(doc.data().unitName);
        });
        setUnits(Array.from(unitNames));
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-indigo-300 animate-pulse tracking-widest uppercase">Loading Units...</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8 md:p-16 font-sans">
      <header className="max-w-5xl mx-auto mb-20 flex items-center gap-10">
        <Link href="/teacher/summary-select" className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center shadow-xl hover:scale-105 transition-all text-slate-200 hover:text-indigo-600 border border-white">
          <span className="text-4xl font-black">←</span>
        </Link>
        <div>
          <p className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-2">Unit View</p>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-800 leading-none">Select Unit</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-4">
        {units.length === 0 ? (
          <p className="text-center py-20 text-slate-400 font-bold">単元が登録されていません</p>
        ) : (
          units.map((unitName) => (
            <Link key={unitName} href={`/teacher/summary-select/unit/display?name=${encodeURIComponent(unitName)}`}>
              <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 flex items-center justify-between group hover:bg-indigo-600 transition-all duration-300">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <IoLayersOutline size={32} />
                  </div>
                  <span className="text-2xl font-black text-slate-800 group-hover:text-white transition-colors">{unitName}</span>
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