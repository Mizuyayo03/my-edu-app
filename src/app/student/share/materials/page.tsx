'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { IoArrowBack, IoDocumentTextOutline, IoImageOutline, IoLinkOutline, IoOpenOutline } from 'react-icons/io5';

export default function StudentMaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // materialsコレクションから公開日順に取得
    const q = query(collection(db, "materials"), orderBy("createdAt", "desc"));
    
    const unsub = onSnapshot(q, (snap) => {
      setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-200 animate-pulse uppercase tracking-widest">
      資料を読み込み中...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <header className="max-w-2xl mx-auto mb-10">
        <Link href="/student/share" className="flex items-center text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity mb-4">
          <IoArrowBack className="w-3 h-3 mr-1" /> 共有メニューに戻る
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase mb-1">Resources</span>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">Materials</h1>
          <p className="text-xs font-bold text-emerald-500 mt-1">授業に役立つ資料やヒント</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-4 pb-20">
        {materials.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-4 border-dashed border-slate-100">
            <p className="text-slate-300 font-black uppercase tracking-widest">まだ共有された資料はありません。</p>
          </div>
        ) : (
          materials.map((item) => (
            <a 
              key={item.id} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block bg-white p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:border-emerald-100 border-4 border-white transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    item.type === 'image' ? 'bg-orange-50 text-orange-500' : 
                    item.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    {item.type === 'image' && <IoImageOutline className="w-7 h-7" />}
                    {item.type === 'pdf' && <IoDocumentTextOutline className="w-7 h-7" />}
                    {item.type === 'link' && <IoLinkOutline className="w-7 h-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full uppercase tracking-wider">
                        {item.category || '一般資料'}
                      </span>
                      <span className="text-[9px] font-bold text-slate-300">
                        {item.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-lg font-black text-slate-800 mt-1 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h2>
                  </div>
                </div>
                <IoOpenOutline className="w-6 h-6 text-slate-200 group-hover:text-emerald-500 transition-colors" />
              </div>
              
              {item.description && (
                <p className="mt-4 px-2 text-sm font-bold text-slate-500 leading-relaxed border-l-2 border-slate-100 ml-16">
                  {item.description}
                </p>
              )}
            </a>
          ))
        )}
      </main>
    </div>
  );
}