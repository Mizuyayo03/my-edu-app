'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { IoArrowBackOutline, IoPersonOutline, IoTimeOutline, IoExpandOutline } from 'react-icons/io5';

export default function ClassGalleryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const classId = params.classId as string;
  const className = searchParams.get('name') || 'クラスギャラリー';

  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) return;

    // 🚀 そのクラスIDに紐づく作品を、新しい順に取得
    const q = query(
      collection(db, "artworks"),
      where("classId", "==", classId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setArtworks(data);
      setLoading(false);
    }, (err) => {
      console.error("ギャラリー取得エラー:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [classId]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <IoArrowBackOutline className="text-2xl" />
            </button>
            <div>
              <h1 className="text-xl font-black italic uppercase tracking-tighter text-slate-800">{className}</h1>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Artwork Collection</p>
            </div>
          </div>
          <div className="bg-indigo-50 px-4 py-1.5 rounded-full">
            <span className="text-[10px] font-black text-indigo-600 uppercase">{artworks.length} 作品</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-widest">Loading Gallery...</div>
        ) : artworks.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center shadow-sm border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold italic">まだ作品が投稿されていません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {artworks.map((art) => (
              <div key={art.id} className="group bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-slate-100">
                {/* 作品画像 */}
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img 
                    src={art.imageUrl} 
                    alt={art.title || '作品'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white/90 p-3 rounded-full text-slate-900 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <IoExpandOutline className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* 作品情報 */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs">
                      <IoPersonOutline />
                    </div>
                    <span className="font-black text-sm text-slate-700">{art.studentName || 'なまえなし'} さん</span>
                  </div>
                  
                  <h3 className="font-black text-lg text-slate-900 mb-1 leading-tight">{art.title || '無題の作品'}</h3>
                  
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-4 pt-4 border-t border-slate-50">
                    <IoTimeOutline />
                    <span>{art.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}