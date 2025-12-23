'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function StudentHistory() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        const q = query(collection(db, "works"), where("uid", "==", u.uid));
        const unsubWorks = onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setWorks(data);
          setLoading(false);
        });
        return () => unsubWorks();
      }
    });
    return () => unsubAuth();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("この提出を取り消しますか？\n（作品データが完全に削除されます）")) return;
    try {
      await deleteDoc(doc(db, "works", id));
      alert("提出を取り消しました");
    } catch (err) {
      alert("削除に失敗しました。");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-200 animate-pulse uppercase tracking-widest">
      履歴を読み込み中...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <header className="max-w-md mx-auto mb-10 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-indigo-500 tracking-[0.3em] uppercase mb-1">My Portfolio</span>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">振り返り機能</h1>
        </div>
        <Link href="/student" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 font-black text-slate-200 hover:text-indigo-600 transition-all text-xl">
          ←
        </Link>
      </header>

      <div className="max-w-md mx-auto space-y-6 pb-20">
        {works.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[48px]">
            <p className="font-black text-slate-300 uppercase tracking-widest">まだ提出された作品がありません</p>
          </div>
        ) : (
          works.map((w) => (
            <div key={w.id} className="bg-white p-8 rounded-[48px] border border-white shadow-sm relative overflow-hidden group">
              {/* 削除ボタン */}
              <button 
                onClick={(e) => handleDelete(w.id, e)} 
                className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-400 rounded-full flex items-center justify-center font-black text-xs hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm"
              >
                ✕
              </button>

              <div className="mb-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 italic">
                  {w.taskName || "無題の課題"}
                </p>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                  {w.createdAt?.toDate().toLocaleDateString() || "最近"}
                </p>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
                {w.images?.map((img: string, i: number) => (
                  <div key={i} className="relative flex-shrink-0 snap-center">
                    <img 
                      src={img} 
                      onClick={() => setSelectedImg(img)} 
                      className="w-44 h-60 object-cover rounded-[32px] border-4 border-slate-50 shadow-sm cursor-zoom-in hover:scale-[1.02] transition-transform" 
                      alt="my work"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 px-2">
                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                  {w.comment ? `“ ${w.comment} ”` : "コメントなし"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 拡大モーダル */}
      {selectedImg && (
        <div 
          className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedImg(null)}
        >
          <img src={selectedImg} className="max-w-full max-h-[80vh] object-contain rounded-[40px] shadow-2xl animate-in zoom-in duration-300" alt="zoom" />
          <p className="absolute bottom-12 text-white/30 font-black uppercase tracking-widest text-[10px]">タップで閉じる</p>
        </div>
      )}
    </div>
  );
}