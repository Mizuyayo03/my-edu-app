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
  
  // モーダル管理用のステート
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

  // 存在する単元名の一覧を取得（重複排除）
  const unitList = Array.from(new Set(works.map(w => w.taskName || "未設定")));

  const handleCreatePortfolio = () => {
    if (!targetUnit || !portfolioTitle) {
      alert("単元名の選択と作品名の記入をしてください");
      return;
    }
    // パラメータを渡して再生画面へ
    router.push(`/student/portfolio?unit=${encodeURIComponent(targetUnit)}&title=${encodeURIComponent(portfolioTitle)}`);
  };

  if (loading) return <div className="text-center py-20 font-black">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="max-w-md mx-auto mb-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-900">振り返り機能</h1>
          <Link href="/student" className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-300">←</Link>
        </div>

        {/* ✅ ポートフォリオを作成ボタン */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-4 bg-white border-2 border-slate-900 rounded-full font-black text-lg hover:bg-slate-900 hover:text-white transition-all shadow-md"
        >
          ポートフォリオを作成
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        <p className="font-black text-slate-400 text-xs tracking-widest uppercase">提出履歴</p>
        {works.map((w) => (
          <div key={w.id} className="bg-white p-6 rounded-[32px] border-2 border-slate-100 shadow-sm">
             <div className="flex justify-between text-[10px] font-black mb-4">
               <span className="text-indigo-500">({w.taskName || "単元未設定"}) : ({w.title || "課題名なし"})</span>
               <span className="text-slate-300">{w.createdAt?.toDate().toLocaleDateString()}</span>
             </div>
             <img src={w.images?.[0]} className="w-full aspect-square object-cover rounded-2xl mb-4" />
          </div>
        ))}
      </main>

      {/* ✅ 1枚目のイメージ：作成設定モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-center font-black text-slate-800 mb-8">ポートフォリオ設定</h2>
            
            <div className="space-y-4">
              {/* 単元選択 */}
              <div className="relative">
                <select 
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold appearance-none outline-none focus:border-indigo-400"
                >
                  <option value="">単元名を選択</option>
                  {unitList.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>

              {/* 作品名記入 */}
              <input 
                type="text" 
                placeholder="作品名を記入"
                value={portfolioTitle}
                onChange={(e) => setPortfolioTitle(e.target.value)}
                className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-indigo-400"
              />

              <button 
                onClick={handleCreatePortfolio}
                className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xl shadow-lg shadow-indigo-200 active:scale-95 transition-all mt-4"
              >
                作成
              </button>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full text-slate-400 font-bold text-sm pt-2"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}