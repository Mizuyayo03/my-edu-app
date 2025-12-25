'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 追加

export default function StudentHistory() {
  const router = useRouter(); // 追加
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        const q = query(collection(db, "works"), where("uid", "==", u.uid));
        const unsubWorks = onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          // 日付順に並び替え
          data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setWorks(data);
          setLoading(false);
        });
        return () => unsubWorks();
      }
    });
    return () => unsubAuth();
  }, []);

  // --- 追加ロジック: 作品を単元(taskName)ごとにグループ化する ---
  const groupedWorks = works.reduce((acc, work) => {
    const key = work.taskName || "未設定の単元";
    if (!acc[key]) acc[key] = [];
    acc[key].push(work);
    return acc;
  }, {} as Record<string, any[]>);

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
          <span className="text-[10px] font-black text-indigo-500 tracking-[0.3em] uppercase mb-1">My History</span>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">振り返り機能</h1>
        </div>
        <Link href="/student" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 font-black text-slate-200 hover:text-indigo-600 transition-all text-xl">
          ←
        </Link>
      </header>

      <div className="max-w-md mx-auto space-y-10 pb-20">
        {Object.keys(groupedWorks).length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[48px]">
            <p className="font-black text-slate-300 uppercase tracking-widest">まだ提出された作品がありません</p>
          </div>
        ) : (
          /* 単元(taskName)ごとにカードを表示 */
          Object.entries(groupedWorks).map(([unitName, unitWorks]) => (
            <div key={unitName} className="bg-white p-8 rounded-[48px] border border-white shadow-xl shadow-indigo-100/50 relative overflow-hidden">
              
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 italic">
                    Unit: {unitName}
                  </p>
                  <h2 className="text-xl font-black text-slate-800 tracking-tighter">
                    {unitName}のまとめ
                  </h2>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase">
                  Total: {unitWorks.length}
                </p>
              </div>
              
              {/* 単元内の最新の作品プレビュー（横スクロール） */}
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide mb-6">
                {unitWorks.map((w) => (
                  <div key={w.id} className="relative flex-shrink-0 snap-center">
                    {/* 削除ボタン */}
                    <button 
                      onClick={(e) => handleDelete(w.id, e)} 
                      className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur text-red-400 rounded-full flex items-center justify-center font-black text-[10px] shadow-sm z-10"
                    >
                      ✕
                    </button>
                    <img 
                      src={w.images?.[0]} 
                      onClick={() => setSelectedImg(w.images?.[0])} 
                      className="w-32 h-44 object-cover rounded-[24px] border-4 border-slate-50 shadow-sm cursor-zoom-in" 
                      alt="my work preview"
                    />
                  </div>
                ))}
              </div>

              {/* ✅ ポートフォリオ作成（再生）ボタン */}
              <button 
                onClick={() => {
                  // URLパラメータに単元名を渡して再生画面へ
                  router.push(`/student/portfolio?unit=${encodeURIComponent(unitName)}`);
                }}
                className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-black text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>ポートフォリオを作成</span>
                <span className="text-xl">✨</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* 拡大モーダル（以前と同じ） */}
      {selectedImg && (
        <div 
          className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedImg(null)}
        >
          <img src={selectedImg} className="max-w-full max-h-[80vh] object-contain rounded-[40px] shadow-2xl" alt="zoom" />
          <p className="absolute bottom-12 text-white/30 font-black uppercase tracking-widest text-[10px]">タップで閉じる</p>
        </div>
      )}
    </div>
  );
}