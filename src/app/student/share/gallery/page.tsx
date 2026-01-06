'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../../firebase/firebase';
import { collection, query, where, onSnapshot, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { IoArrowBack, IoPlay, IoPause, IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5';

export default function GalleryPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) { setLoading(false); return; }
      try {
        const userQ = query(collection(db, "users"), where("email", "==", user.email?.toLowerCase()));
        const userSnap = await getDocs(userQ);
        if (userSnap.empty) { setLoading(false); return; }
        const myClassId = userSnap.docs[0].data().classId;

        const worksQ = query(
          collection(db, "works"),
          where("classId", "==", myClassId),
          where("isPublished", "==", true),
          orderBy("createdAt", "desc")
        );

        const unsubWorks = onSnapshot(worksQ, (snap) => {
          const allWorks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const grouped: { [key: string]: any } = {};
          allWorks.forEach((work: any) => {
            const uid = work.uid;
            if (!grouped[uid]) {
              grouped[uid] = {
                uid: uid,
                studentName: work.studentName || "なまえなし",
                studentNumber: work.studentNumber || "--",
                works: []
              };
            }
            grouped[uid].works.push(work);
          });
          const list = Object.values(grouped).sort((a: any, b: any) => 
            (parseInt(a.studentNumber) || 999) - (parseInt(b.studentNumber) || 999)
          );
          setPortfolios(list);
          setLoading(false);
        });
        return () => unsubWorks();
      } catch (e) {
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <Link href="/student" className="text-indigo-600 font-bold flex items-center mb-2 text-sm">
            <IoArrowBack className="mr-1" /> もどる
          </Link>
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">生徒ギャラリー</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {portfolios.map((p) => {
          const latestWork = p.works[0];
          // 作品名の候補をすべてチェック
          const displayTitle = latestWork?.portfolioTitle || latestWork?.title || latestWork?.workTitle || "作品名未入力";
          const displayUnit = latestWork?.taskName || latestWork?.unitName || "単元未設定";

          return (
            <div key={p.uid} onClick={() => setSelectedPortfolio(p)} className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border-2 border-white group">
              <div className="aspect-square bg-slate-100 overflow-hidden relative">
                <img src={latestWork?.images?.[0] || latestWork?.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                  {displayUnit}
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm font-black text-slate-800">No.{p.studentNumber} {p.studentName}</div>
                <div className="text-[11px] text-slate-400 font-bold truncate mt-1">{displayTitle}</div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPortfolio && (
        <PortfolioDetailModal portfolio={selectedPortfolio} onClose={() => setSelectedPortfolio(null)} />
      )}
    </div>
  );
}

function PortfolioDetailModal({ portfolio, onClose }: { portfolio: any, onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % portfolio.works.length);
      }, 4000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, portfolio.works.length]);

  const currentWork = portfolio.works[index];
  
  // 作品名と単元名の取得ロジック（保存されている可能性のある名前をすべて網羅）
  const workTitle = currentWork.portfolioTitle || currentWork.title || currentWork.workTitle || "無題の作品";
  const unitName = currentWork.taskName || currentWork.unitName || "単元名なし";

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="p-6 flex justify-between items-center border-b bg-white">
        <div>
          <div className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-1">{unitName}</div>
          <h2 className="text-3xl font-black text-slate-900">{workTitle}</h2>
        </div>
        <button onClick={onClose} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
          <IoClose size={28} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col items-center py-8 px-6">
        <div className="max-w-4xl w-full">
          <div className="relative aspect-video bg-black rounded-[40px] shadow-2xl overflow-hidden mb-8 group">
            <img src={currentWork.images?.[0] || currentWork.image} className="w-full h-full object-contain" key={currentWork.id} />
            
            <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => setIndex((prev) => (prev - 1 + portfolio.works.length) % portfolio.works.length)} className="bg-black/30 backdrop-blur-md p-4 rounded-full text-white">
                 <IoChevronBack size={30}/>
               </button>
               <button onClick={() => setIsPlaying(!isPlaying)} className="bg-indigo-600 p-6 rounded-full text-white shadow-xl transform active:scale-95 transition-transform">
                 {isPlaying ? <IoPause size={40} /> : <IoPlay size={40} />}
               </button>
               <button onClick={() => setIndex((prev) => (prev + 1) % portfolio.works.length)} className="bg-black/30 backdrop-blur-md p-4 rounded-full text-white">
                 <IoChevronForward size={30}/></button>
            </div>

            <div className="absolute bottom-6 right-8 bg-black/60 text-white px-4 py-1 rounded-full font-black text-sm">
              {index + 1} / {portfolio.works.length}
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-200">
                 {portfolio.studentNumber}
               </div>
               <div>
                 <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Creator</div>
                 <div className="text-2xl font-black text-slate-800">{portfolio.studentName}</div>
               </div>
            </div>
            <div className="bg-slate-50 p-8 rounded-[24px] text-xl text-slate-700 font-bold leading-relaxed border-l-8 border-indigo-500 min-h-[120px]">
              {currentWork.comment || "感想は入力されていません。"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}