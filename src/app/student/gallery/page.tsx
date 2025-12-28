'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { IoArrowBack, IoPlay, IoTimeOutline, IoChevronForward } from 'react-icons/io5';

export default function GalleryPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. ログインユーザーのクラス情報を取得
        const userQ = query(collection(db, "users"), where("email", "==", user.email?.toLowerCase()));
        const userSnap = await getDocs(userQ);
        if (userSnap.empty) { setLoading(false); return; }

        const userData = userSnap.docs[0].data();
        setStudentInfo(userData);
        const myClassId = userData.classId;

        // 2. 「同じクラス」かつ「公開済み」の作品をリアルタイム取得
        const q = query(
          collection(db, "works"),
          where("classId", "==", myClassId),
          where("isPublished", "==", true)
        );

        const unsubWorks = onSnapshot(q, (snap) => {
          const allWorks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // 3. 振り返り形式にするために「生徒×単元」でグループ化
          const grouped: { [key: string]: any } = {};
          allWorks.forEach((work: any) => {
            const key = `${work.uid}_${work.taskId}`;
            if (!grouped[key]) {
              grouped[key] = {
                uid: work.uid,
                studentName: work.studentName,
                studentNumber: work.studentNumber,
                taskName: work.taskName || "課題作品",
                works: []
              };
            }
            grouped[key].works.push(work);
          });

          const portfolioList = Object.values(grouped).map((p: any) => {
            // 時系列に並べる
            p.works.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            return p;
          });

          // 出席番号順にソート
          portfolioList.sort((a: any, b: any) => (parseInt(a.studentNumber) || 999) - (parseInt(b.studentNumber) || 999));
          setPortfolios(portfolioList);
          setLoading(false);
        });
        return () => unsubWorks();
      }
    });
    return () => unsubAuth();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 animate-pulse tracking-widest">
      PORTFOLIO GALLERY LOADING...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
        <div>
          <Link href="/student" className="text-indigo-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center hover:opacity-70 transition-all">
            <IoArrowBack className="mr-2" size={16} /> Back to Dashboard
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 tracking-[0.4em] uppercase mb-2">Exhibition Space</span>
            <h1 className="text-5xl font-black italic tracking-tighter text-slate-900 uppercase">
              Class <span className="text-indigo-600">Gallery</span>
            </h1>
          </div>
        </div>
        <div className="hidden md:block bg-white px-10 py-4 rounded-full shadow-2xl shadow-indigo-100/50 border border-indigo-50 text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">
          <span className="text-indigo-600 mr-2">{portfolios.length}</span> Portfolios Live
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {portfolios.map((p, idx) => (
          <PortfolioJourneyCard key={idx} portfolio={p} />
        ))}
      </div>
    </div>
  );
}

// 💡 振り返り機能を再現したスライドカード
function PortfolioJourneyCard({ portfolio }: { portfolio: any }) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && portfolio.works.length > 1) {
      timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % portfolio.works.length);
      }, 700); // 振り返り機能に近いスピード
    }
    return () => clearInterval(timer);
  }, [isPlaying, portfolio.works.length]);

  const currentWork = portfolio.works[index];

  return (
    <div 
      className="group bg-white rounded-[56px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-4 border-white overflow-hidden relative"
      onMouseEnter={() => setIsPlaying(true)}
      onMouseLeave={() => { setIsPlaying(false); setIndex(0); }}
    >
      {/* プレイヤースペース */}
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        <img 
          src={currentWork.images?.[0] || currentWork.image} 
          className="w-full h-full object-cover transition-all duration-700"
          style={{ 
            filter: `brightness(${currentWork.brightness || 1})`,
            transform: isPlaying ? 'scale(1.05)' : 'scale(1)'
          }}
          alt="portfolio" 
        />
        
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* ステータスバッジ */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <span className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl font-black italic text-[10px] shadow-lg">
            No.{portfolio.studentNumber}
          </span>
          {isPlaying && (
            <div className="bg-indigo-500 text-white px-4 py-2 rounded-2xl font-black text-[8px] uppercase tracking-widest flex items-center gap-2 animate-bounce">
              <IoPlay size={10} /> Playing Journey
            </div>
          )}
        </div>

        {/* 進捗インジケーター */}
        <div className="absolute bottom-6 right-8 text-white font-black text-3xl italic opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
          {index + 1}<span className="text-sm text-white/50 not-italic ml-1">/ {portfolio.works.length}</span>
        </div>
      </div>

      {/* テキストエリア */}
      <div className="p-10 pt-8">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">{portfolio.taskName}</p>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{portfolio.studentName}</h2>
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
            <IoChevronForward size={20} />
          </div>
        </div>
        <p className="text-sm text-slate-500 font-bold leading-relaxed line-clamp-2 h-10">
          {currentWork.comment || "成長の記録を公開中"}
        </p>
      </div>

      {/* プログレスバー（再生中に連動） */}
      <div className="absolute bottom-0 left-0 h-2 bg-indigo-100 w-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-300 ease-linear"
          style={{ width: `${((index + 1) / portfolio.works.length) * 100}%` }}
        />
      </div>
    </div>
  );
}