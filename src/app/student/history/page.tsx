'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore'; // getDocsを追加
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentHistory() {
  const router = useRouter();
  const [works, setWorks] = useState<any[]>([]);
  const [taskLookup, setTaskLookup] = useState<Record<string, string>>({}); // taskIdからunitNameを引くための辞書
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  // モーダル管理用のステート
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUnit, setTargetUnit] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");

  useEffect(() => {
    // 1. 先生が作った課題箱(tasks)を取得して、taskIdとunitNameの対応表を作る
    const fetchTaskInfo = async () => {
      try {
        const taskSnap = await getDocs(collection(db, "tasks"));
        const lookup: Record<string, string> = {};
        taskSnap.docs.forEach(d => {
          const data = d.data();
          // unitNameがあればそれ、なければtitle(課題名)を予備として使う
          lookup[d.id] = data.unitName || data.title || "未分類";
        });
        setTaskLookup(lookup);
      } catch (e) {
        console.error("Task fetch error:", e);
      }
    };

    fetchTaskInfo();

    // 2. 自分の作品(works)を取得する
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        const q = query(collection(db, "works"), where("uid", "==", u.uid));
        const unsubWorks = onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          // 日付順に並び替え
          data.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
          setWorks(data);
          setLoading(false);
        });
        return () => unsubWorks();
      }
    });
    return () => unsubAuth();
  }, []);

  // --- 作品を「本当の単元名」ごとにグループ化する ---
  const groupedWorks: Record<string, any[]> = works.reduce((acc, work) => {
    // taskLookupを使って、作品のtaskIdから先生が決めたunitNameを取得
    const unitName = taskLookup[work.taskId] || "未分類";
    
    if (!acc[unitName]) acc[unitName] = [];
    acc[unitName].push(work);
    return acc;
  }, {} as Record<string, any[]>);

  // モーダル内の選択肢用の単元リスト
  const unitList = Object.keys(groupedWorks).filter(u => u !== "未分類");

  const handleCreatePortfolio = () => {
    if (!targetUnit || !portfolioTitle) {
      alert("単元名の選択と作品名の記入をしてください");
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

      {/* ポートフォリオ作成ボタンエリア */}
      <div className="max-w-md mx-auto mb-10">
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
              <button 
                onClick={(e) => handleDelete(w.id, e)} 
                className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-400 rounded-full flex items-center justify-center font-black text-xs hover:bg-red-500 hover:text-white transition-all z-10 shadow-sm"
              >
                ✕
              </button>

              <div className="mb-4">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 italic">
                  {/* taskLookupを使って単元名を表示 */}
                  {taskLookup[w.taskId] || "未分類"} : {w.taskName || "無題"}
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

      {/* 設定モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl border-t-8 border-indigo-600 animate-in zoom-in duration-200 text-center">
            <h2 className="text-2xl font-black text-indigo-900 italic uppercase tracking-tighter mb-8">Portfolio Settings</h2>
            
            <div className="space-y-5">
              <div className="text-left">
                <label className="text-[10px] font-black text-slate-300 uppercase ml-4 tracking-widest mb-2 block">単元を選択</label>
                <select 
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="w-full p-5 bg-indigo-50/50 border-2 border-transparent rounded-[24px] font-black text-slate-700 outline-none focus:border-indigo-300 appearance-none"
                >
                  <option value="">選択してください</option>
                  {unitList.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>

              <div className="text-left">
                <label className="text-[10px] font-black text-slate-300 uppercase ml-4 tracking-widest mb-2 block">作品名（タイトル）</label>
                <input 
                  type="text" 
                  placeholder="例：僕のアニメ制作記録"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  className="w-full p-5 bg-indigo-50/50 border-2 border-transparent rounded-[24px] font-black text-slate-700 outline-none focus:border-indigo-300"
                />
              </div>

              <button 
                onClick={handleCreatePortfolio}
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all mt-4"
              >
                作成を開始する
              </button>
              
              <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest pt-2">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {/* 拡大表示 */}
      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-6" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} className="max-w-full max-h-[80vh] object-contain rounded-[40px] shadow-2xl" alt="zoom" />
        </div>
      )}
    </div>
  );
}