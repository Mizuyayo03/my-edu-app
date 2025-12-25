'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentHistory() {
  const router = useRouter();
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // モーダル用ステート
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUnit, setTargetUnit] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");

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

  // 重複のない単元リストを作成
  const unitList = Array.from(new Set(works.map(w => w.taskName).filter(Boolean)));

  const handleCreatePortfolio = () => {
    if (!targetUnit || !portfolioTitle) {
      alert("単元名と作品名を入力してください");
      return;
    }
    router.push(`/student/portfolio?unit=${encodeURIComponent(targetUnit)}&title=${encodeURIComponent(portfolioTitle)}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("この提出を取り消しますか？")) return;
    try {
      await deleteDoc(doc(db, "works", id));
    } catch (err) {
      alert("削除に失敗しました。");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-200 animate-pulse">読み込み中...</div>;

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

      <div className="max-w-md mx-auto mb-8">
        {/* ✅ デザインを統一した「ポートフォリオ作成」ボタン */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-5 bg-white text-indigo-600 rounded-[28px] font-black text-lg shadow-xl shadow-indigo-100 border-2 border-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span className="text-2xl">✨</span>
          ポートフォリオを作成
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-6 pb-20">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">提出履歴</p>
        {works.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[48px]">
            <p className="font-black text-slate-300 uppercase tracking-widest">まだ提出された作品がありません</p>
          </div>
        ) : (
          works.map((w) => (
            <div key={w.id} className="bg-white p-8 rounded-[48px] border border-white shadow-sm relative overflow-hidden group">
              <button onClick={(e) => handleDelete(w.id, e)} className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-400 rounded-full flex items-center justify-center font-black text-xs z-10">✕</button>

              <div className="mb-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 italic">
                  ({w.taskName || "単元未設定"}) : ({w.title || "課題名なし"})
                </p>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                  {w.createdAt?.toDate().toLocaleDateString() || "最近"}
                </p>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {w.images?.map((img: string, i: number) => (
                  <img key={i} src={img} onClick={() => setSelectedImg(img)} className="w-44 h-60 object-cover rounded-[32px] border-4 border-slate-50 shadow-sm cursor-zoom-in" alt="work" />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ 1枚目イメージの設定モーダル（デザインを他と統一） */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl border-t-8 border-indigo-600 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-indigo-900 italic uppercase tracking-tighter text-center mb-8">ポートフォリオ設定</h2>
            
            <div className="space-y-5">
              <select 
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full p-5 bg-indigo-50/50 border-2 border-transparent rounded-[24px] font-black text-slate-700 outline-none focus:border-indigo-300 appearance-none"
              >
                <option value="">単元名を選択</option>
                {unitList.map(unit => <option key={unit} value={unit}>{unit}</option>)}
              </select>

              <input 
                type="text" 
                placeholder="作品名を記入"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                className="w-full p-5 bg-indigo-50/50 border-2 border-transparent rounded-[24px] font-black text-slate-700 outline-none focus:border-indigo-300"
              />

              <button 
                onClick={handleCreatePortfolio}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all mt-4"
              >
                作成する
              </button>
              
              <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest pt-2">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 拡大モーダル */}
      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-6" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} className="max-w-full max-h-[80vh] object-contain rounded-[40px]" alt="zoom" />
        </div>
      )}
    </div>
  );
}