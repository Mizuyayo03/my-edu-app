'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../../firebase/firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { IoArrowBack, IoImageOutline, IoLinkOutline, IoBulbOutline } from 'react-icons/io5';

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const saved = localStorage.getItem('studentInfo');
      if (saved && user) {
        const info = JSON.parse(saved);
        
        // 🚀 先生側の shared_resources コレクションを監視
        const q = query(
          collection(db, "shared_resources"), 
          where("classId", "==", info.classId),
          orderBy("createdAt", "desc")
        );
        
        const unsubRes = onSnapshot(q, (snap) => {
          setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }, (err) => {
          console.error("Firestore Error:", err);
          setLoading(false);
        });
        return () => unsubRes();
      } else {
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-200 animate-pulse uppercase tracking-widest">LOADING...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
      <header className="max-w-2xl mx-auto mb-10">
        <Link href="/student/share" className="flex items-center text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity mb-4">
          <IoArrowBack className="w-3 h-3 mr-1" /> 共有メニューに戻る
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase mb-1">Resources</span>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">Class Materials</h1>
          <p className="text-xs font-bold text-indigo-500 mt-1 uppercase tracking-tighter">先生からの共有資料</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-6 pb-20">
        {materials.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-4 border-dashed border-slate-100">
            <p className="text-slate-300 font-black uppercase tracking-widest italic">まだ共有された資料はありません</p>
          </div>
        ) : (
          materials.map((item) => (
            <div key={item.id} className="bg-white rounded-[40px] shadow-sm border-4 border-white overflow-hidden group hover:shadow-xl transition-all">
              {/* 🔵 imageUrl を表示 */}
              {item.imageUrl && (
                <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500">
                        {item.type === 'camera' ? <IoImageOutline size={20} /> : <IoBulbOutline size={20} />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'New'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 leading-tight">{item.title}</h2>
                  </div>
                  {item.type === 'link' && item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-colors">
                      <IoLinkOutline size={24} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}