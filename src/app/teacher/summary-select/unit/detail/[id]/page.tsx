'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../../../../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { IoClose, IoChatbubbleOutline, IoTimeOutline, IoBulbOutline, IoLayersOutline } from 'react-icons/io5';

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWork() {
      if (params.id) {
        try {
          // 💡 コレクション名を "works" に修正
          const docRef = doc(db, "works", params.id as string);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setWork({ id: docSnap.id, ...docSnap.data() });
          }
        } catch (error) {
          console.error("Error fetching work detail:", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchWork();
  }, [params.id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!work) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      <p className="font-black text-slate-300 uppercase tracking-widest">Work not found</p>
      <button onClick={() => router.back()} className="text-indigo-500 font-bold underline">戻る</button>
    </div>
  );

  // 💡 画像URLの解決（配列 images の 0番目を優先）
  const displayImg = work.images?.[0] || work.imageUrl || "";

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">
      {/* 閉じるボタン */}
      <button 
        onClick={() => router.back()}
        className="fixed top-8 right-8 z-50 w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
      >
        <IoClose size={32} className="group-hover:rotate-90 transition-transform" />
      </button>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col lg:flex-row gap-16">
        {/* 左側：作品画像表示 */}
        <div className="lg:w-3/5">
          <div className="sticky top-12">
            <div className="bg-[#F8FAFC] rounded-[64px] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
              {displayImg ? (
                <img 
                  src={displayImg} 
                  alt={work.title} 
                  className="w-full h-auto object-contain max-h-[85vh]"
                />
              ) : (
                <div className="aspect-square flex items-center justify-center text-slate-200 bg-slate-50">
                  No Image Available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右側：詳細情報 */}
        <div className="lg:w-2/5 space-y-12">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                <IoLayersOutline />
                {work.unitName || "UNIT"}
              </div>
              <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                No.{work.studentNumber} {work.studentName}
              </div>
            </div>

            <div className="space-y-2">
              {/* 生徒がつけたポートフォリオ名を大きく表示 */}
              <h1 className="text-6xl font-black italic tracking-tighter text-slate-900 leading-[0.9]">
                {work.portfolioTitle || work.title || "UNTITLED"}
              </h1>
              {work.portfolioTitle && (
                <p className="text-xl font-bold text-slate-300 italic tracking-tight">
                  Task: {work.title}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
              <IoTimeOutline size={16} />
              <span>
                {work.createdAt?.toDate ? 
                  work.createdAt.toDate().toLocaleDateString() : 
                  "日付データなし"}
              </span>
            </div>
          </header>

          <hr className="border-slate-100" />

          {/* 生徒のコメント */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 text-indigo-500">
              <IoChatbubbleOutline size={28} />
              <h3 className="text-lg font-black uppercase tracking-[0.2em]">Reflection</h3>
            </div>
            <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 shadow-inner">
              <p className="text-xl font-bold leading-relaxed text-slate-700 whitespace-pre-wrap">
                {work.reflection || "生徒からの振り返りコメントはありません。"}
              </p>
            </div>
          </section>

          {/* 先生のアドバイス */}
          <section className="space-y-6">
            <div className="flex items-center gap-4 text-emerald-500">
              <IoBulbOutline size={28} />
              <h3 className="text-lg font-black uppercase tracking-[0.2em]">Teacher's Advice</h3>
            </div>
            <div className="bg-emerald-50/50 p-10 rounded-[48px] border border-emerald-100 shadow-sm">
              {work.feedback ? (
                <p className="text-xl font-bold leading-relaxed text-emerald-900 whitespace-pre-wrap">
                  {work.feedback}
                </p>
              ) : (
                <p className="text-emerald-300 font-black italic text-lg text-center">
                  アドバイスはまだ入力されていません。
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}