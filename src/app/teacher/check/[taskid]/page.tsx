'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoArrowBack, IoChatbubbleEllipsesOutline, IoCheckmarkDone, IoTimeOutline } from 'react-icons/io5';

export default function TeacherCheckPage() {
  const { taskId } = useParams();
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<any>(null); // フィードバック中の作品
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    if (!taskId) return;

    // この課題(taskId)に紐づく生徒の提出物を取得
    const q = query(collection(db, "works"), where("taskId", "==", taskId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // 出席番号順に並び替え
      data.sort((a: any, b: any) => (parseInt(a.studentNumber) || 999) - (parseInt(b.studentNumber) || 999));
      setWorks(data);
      setLoading(false);
    });

    return () => unsub();
  }, [taskId]);

  // フィードバック保存処理
  const handleSaveFeedback = async () => {
    if (!selectedWork || !feedbackText.trim()) return;

    try {
      const workRef = doc(db, "works", selectedWork.id);
      await updateDoc(workRef, {
        feedback: feedbackText,
        feedbackAt: serverTimestamp(),
        status: 'checked' // 添削済みフラグ
      });
      setSelectedWork(null);
      setFeedbackText('');
      alert("フィードバックを送信しました");
    } catch (e) {
      console.error(e);
      alert("エラーが発生しました");
    }
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-slate-300">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      <header className="max-w-5xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <Link href="/teacher/dashboard" className="flex items-center text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-2">
            <IoArrowBack className="mr-1" /> ダッシュボードへ
          </Link>
          <h1 className="text-3xl font-black tracking-tighter text-slate-800 uppercase italic">Submission Check</h1>
        </div>
        <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100 text-[10px] font-black text-slate-400">
          {works.length} 提出
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左側：提出物リスト */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">生徒の作品一覧</h2>
          {works.map((work) => (
            <div 
              key={work.id}
              onClick={() => {
                setSelectedWork(work);
                setFeedbackText(work.feedback || '');
              }}
              className={`bg-white p-4 rounded-[32px] cursor-pointer transition-all border-4 flex items-center justify-between ${selectedWork?.id === work.id ? 'border-indigo-500 shadow-xl scale-[1.02]' : 'border-white hover:border-slate-100'}`}
            >
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic shadow-lg">
                  {work.studentNumber}
                </span>
                <div>
                  <p className="text-lg font-black text-slate-800">{work.studentName}</p>
                  <div className="flex items-center gap-2">
                    {work.status === 'checked' ? (
                      <span className="flex items-center text-[8px] font-black text-emerald-500 uppercase">
                        <IoCheckmarkDone className="mr-1" /> Checked
                      </span>
                    ) : (
                      <span className="flex items-center text-[8px] font-black text-orange-400 uppercase">
                        <IoTimeOutline className="mr-1" /> Waiting
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <img src={work.images ? work.images[0] : work.image} className="w-14 h-14 object-cover rounded-xl" alt="thumb" />
            </div>
          ))}
        </div>

        {/* 右側：フィードバック入力エリア */}
        <div className="sticky top-10">
          {selectedWork ? (
            <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-4 mb-6">
                <img src={selectedWork.images ? selectedWork.images[0] : selectedWork.image} className="w-20 h-20 object-cover rounded-[24px] border-2 border-white/20" alt="main" />
                <div>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest">Feedback for</p>
                  <p className="text-2xl font-black">{selectedWork.studentName}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">メッセージを送る</label>
                <textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="作品のいいところや、アドバイスを入力..."
                  className="w-full bg-white/10 border-2 border-white/10 rounded-[24px] p-6 text-white font-bold placeholder:text-slate-600 focus:border-indigo-500 focus:ring-0 transition-all min-h-[160px] outline-none"
                />
                <button 
                  onClick={handleSaveFeedback}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  フィードバックを確定
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[400px] border-4 border-dashed border-slate-200 rounded-[40px] flex items-center justify-center text-center p-10">
              <p className="text-slate-300 font-black uppercase tracking-widest">
                左のリストから作品を選んで<br />アドバイスを送りましょう
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}