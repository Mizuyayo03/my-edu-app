'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 型の定義
interface Work {
  id: string;
  uid: string;
  taskId: string;
  taskName?: string;
  title?: string;
  images?: string[];
  comment?: string;
  createdAt?: { seconds: number };
}

export default function StudentHistory() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [taskLookup, setTaskLookup] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUnit, setTargetUnit] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");

  useEffect(() => {
    const fetchTaskInfo = async () => {
      try {
        const taskSnap = await getDocs(collection(db, "tasks"));
        const lookup: Record<string, string> = {};
        taskSnap.docs.forEach(d => {
          const data = d.data();
          lookup[d.id] = data.unitName || data.title || "未分類";
        });
        setTaskLookup(lookup);
      } catch (e) {
        console.error(e);
      }
    };

    fetchTaskInfo();

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        // インデックスエラーを避けるため、シンプルなクエリにしてソートは後で行う
        const q = query(collection(db, "works"), where("uid", "==", u.uid));
        const unsubWorks = onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Work));
          // メモリ上でソートすることでインデックスエラーを回避
          data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setWorks(data);
          setLoading(false);
        }, () => setLoading(false));
        return () => unsubWorks();
      }
    });
    return () => unsubAuth();
  }, []);

  // グループ化の計算（型を明示）
  const groupedWorks: Record<string, Work[]> = works.reduce((acc, work) => {
    const unitName = taskLookup[work.taskId] || "未分類";
    if (!acc[unitName]) acc[unitName] = [];
    acc[unitName].push(work);
    return acc;
  }, {} as Record<string, Work[]>);

  const unitList = Object.keys(groupedWorks).filter(u => u !== "未分類");

  const handleCreatePortfolio = () => {
    if (!targetUnit || !portfolioTitle) {
      alert("項目を入力してください");
      return;
    }
    router.push(`/student/portfolio?unit=${encodeURIComponent(targetUnit)}&title=${encodeURIComponent(portfolioTitle)}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "works", id));
    } catch (err) {
      alert("失敗しました");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300">LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <header className="max-w-md mx-auto mb-10 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-indigo-500 tracking-[0.3em] uppercase mb-1">My Portfolio</span>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">振り返り機能</h1>
        </div>
        <Link href="/student" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 font-black text-slate-200">
          ←
        </Link>
      </header>

      <div className="max-w-md mx-auto mb-10">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-5 bg-white text-indigo-600 rounded-[28px] font-black text-lg shadow-xl shadow-indigo-100 border-2 border-indigo-50 active:scale-95 transition-all"
        >
          ポートフォリオを作成
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-6 pb-20">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">提出履歴</p>
        
        {works.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-slate-200 rounded-[48px] text-slate-300 font-black">NO DATA</div>
        ) : (
          works.map((w) => (
            <div key={w.id} className="bg-white p-8 rounded-[48px] border border-white shadow-sm relative overflow-hidden">
              <button onClick={(e) => handleDelete(w.id, e)} className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-400 rounded-full font-black text-xs">✕</button>

              <div className="mb-4">
                <p className="text-[10px] font-black text-indigo-400 italic">
                  {taskLookup[w.taskId] || "未分類"} : {w.taskName || "無題"}
                </p>
                <p className="text-[9px] font-bold text-slate-300 uppercase">
                  {w.createdAt ? new Date(w.createdAt.seconds * 1000).toLocaleDateString() : "最近"}
                </p>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4">
                {w.images?.map((img, i) => (
                  <img key={i} src={img} onClick={() => setSelectedImg(img)} className="w-44 h-60 object-cover rounded-[32px] border-4 border-slate-50 cursor-zoom-in" alt="work" />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl border-t-8 border-indigo-600 text-center">
            <h2 className="text-2xl font-black text-indigo-900 italic mb-8">Portfolio Settings</h2>
            <div className="space-y-5 text-left">
              <label className="text-[10px] font-black text-slate-300 uppercase ml-4">単元を選択</label>
              <select value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)} className="w-full p-5 bg-indigo-50/50 rounded-[24px] font-black text-slate-700 outline-none">
                <option value="">選択してください</option>
                {unitList.map(unit => <option key={unit} value={unit}>{unit}</option>)}
              </select>
              <label className="text-[10px] font-black text-slate-300 uppercase ml-4">作品名</label>
              <input type="text" placeholder="作品名を記入" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} className="w-full p-5 bg-indigo-50/50 rounded-[24px] font-black text-slate-700 outline-none" />
              <button onClick={handleCreatePortfolio} className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg mt-4 active:scale-95 transition-all">作成を開始</button>
              <button onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-black text-[10px] pt-2">キャンセル</button>
            </div>
          </div>
        </div>
      )}

      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/95 z-50 flex items-center justify-center p-6" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} className="max-w-full max-h-[80vh] object-contain rounded-[40px]" alt="zoom" />
        </div>
      )}
    </div>
  );
}