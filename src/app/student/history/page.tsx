'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { db, auth } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, doc, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoChevronBack, IoTrashOutline, IoAddOutline, IoCloseOutline } from 'react-icons/io5';

// --- 型定義 ---
interface Work {
  id: string;
  uid: string;
  taskId: string;
  taskName?: string;
  images?: string[];
  comment?: string;
  createdAt?: Timestamp | any;
}

// --- メインコンポーネント ---
export default function StudentHistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300">読み込み中...</div>}>
      <HistoryContent />
    </Suspense>
  );
}

// --- コンテンツ本体 ---
function HistoryContent() {
  const router = useRouter();
  const [works, setWorks] = useState<Work[]>([]);
  const [taskLookup, setTaskLookup] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetUnit, setTargetUnit] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");

  useEffect(() => {
    // 1. 課題情報の取得（単元名などのルックアップ用）
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
        console.error("Task fetch error:", e);
      }
    };

    fetchTaskInfo();

    // 2. 認証と提出履歴のリアルタイム取得
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const q = query(collection(db, "works"), where("uid", "==", u.uid));
        const unsubWorks = onSnapshot(q, (snap) => {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Work));
          // メモリ上でソート（インデックス作成の手間を省く工夫を継続）
          data.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          setWorks(data);
          setLoading(false);
        }, () => setLoading(false));
        return () => unsubWorks();
      } else {
        router.push('/student/login');
      }
    });

    return () => unsubAuth();
  }, [router]);

  // グループ化：ポートフォリオ作成用の単元リスト
  const groupedWorks: Record<string, Work[]> = works.reduce((acc, work) => {
    const unitName = taskLookup[work.taskId] || "未分類";
    if (!acc[unitName]) acc[unitName] = [];
    acc[unitName].push(work);
    return acc;
  }, {} as Record<string, Work[]>);

  const unitList = Object.keys(groupedWorks).filter(u => u !== "未分類");

  const handleCreatePortfolio = () => {
    if (!targetUnit || !portfolioTitle) {
      alert("単元と作品名を入力してください");
      return;
    }
    router.push(`/student/portfolio?unit=${encodeURIComponent(targetUnit)}&title=${encodeURIComponent(portfolioTitle)}`);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("この提出作品を削除しますか？")) return;
    try {
      await deleteDoc(doc(db, "works", id));
    } catch (err) {
      alert("削除に失敗しました");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 italic animate-pulse">
      LOADING...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans pb-24">
      <header className="max-w-md mx-auto mb-10 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-indigo-500 tracking-[0.3em] uppercase mb-1">My Collection</span>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">振り返り</h1>
        </div>
        <Link href="/student" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
          <IoChevronBack size={20} />
        </Link>
      </header>

      {/* ポートフォリオ作成ボタン */}
      <div className="max-w-md mx-auto mb-12">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-lg shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <IoAddOutline size={24} />
          ポートフォリオを作る
        </button>
      </div>

      <div className="max-w-md mx-auto space-y-8">
        <div className="flex items-center justify-between px-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">提出履歴</p>
          <span className="text-[10px] font-black text-indigo-400">{works.length} 件</span>
        </div>
        
        {works.length === 0 ? (
          <div className="text-center py-40 border-4 border-dashed border-slate-200 rounded-[56px] text-slate-300 font-black italic">
            NO DATA
          </div>
        ) : (
          works.map((w) => (
            <div key={w.id} className="bg-white p-8 rounded-[48px] border border-white shadow-sm relative group hover:shadow-md transition-all">
              <button 
                onClick={(e) => handleDelete(w.id, e)} 
                className="absolute top-6 right-6 w-10 h-10 bg-red-50 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IoTrashOutline size={18} />
              </button>

              <div className="mb-6">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-1">
                  {taskLookup[w.taskId] || "未分類"}
                </p>
                <h3 className="text-xl font-black text-slate-800 italic">{w.taskName || "無題の課題"}</h3>
                <p className="text-[9px] font-bold text-slate-300 mt-1">
                  {w.createdAt?.seconds ? new Date(w.createdAt.seconds * 1000).toLocaleDateString() : "最近"}
                </p>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {w.images?.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    onClick={() => setSelectedImg(img)} 
                    className="w-48 h-64 object-cover rounded-[32px] border-4 border-slate-50 cursor-zoom-in snap-center hover:scale-[1.02] transition-transform" 
                    alt="work" 
                  />
                ))}
              </div>
              
              {w.comment && (
                <div className="mt-4 p-5 bg-slate-50 rounded-[24px]">
                  <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                    "{w.comment}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 設定モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[48px] p-10 shadow-2xl border-t-[12px] border-indigo-600">
            <h2 className="text-2xl font-black text-slate-800 italic mb-8 tracking-tighter text-center">PORTFOLIO</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase ml-4 tracking-widest">単元を選択</label>
                <select 
                  value={targetUnit} 
                  onChange={(e) => setTargetUnit(e.target.value)} 
                  className="w-full mt-2 p-5 bg-slate-50 rounded-[24px] font-black text-slate-700 outline-none border-2 border-transparent focus:border-indigo-100 transition-all appearance-none"
                >
                  <option value="">選択してください</option>
                  {unitList.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-300 uppercase ml-4 tracking-widest">作品名・タイトル</label>
                <input 
                  type="text" 
                  placeholder="例：自画像 2024" 
                  value={portfolioTitle} 
                  onChange={(e) => setPortfolioTitle(e.target.value)} 
                  className="w-full mt-2 p-5 bg-slate-50 rounded-[24px] font-black text-slate-700 outline-none border-2 border-transparent focus:border-indigo-100 transition-all" 
                />
              </div>

              <button 
                onClick={handleCreatePortfolio} 
                className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg mt-4 shadow-lg shadow-indigo-100 active:scale-95 transition-all"
              >
                作成を開始する
              </button>
              
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-full text-slate-400 font-black text-[10px] uppercase tracking-widest"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 画像拡大表示 */}
      {selectedImg && (
        <div 
          className="fixed inset-0 bg-slate-900/95 z-[60] flex items-center justify-center p-4 md:p-10" 
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-10 right-10 text-white opacity-50 hover:opacity-100 transition-opacity">
            <IoCloseOutline size={40} />
          </button>
          <img src={selectedImg} className="max-w-full max-h-full object-contain rounded-[24px] shadow-2xl" alt="zoom" />
        </div>
      )}
    </div>
  );
}