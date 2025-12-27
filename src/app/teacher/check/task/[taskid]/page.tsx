'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { IoArrowBack, IoCheckmarkDone, IoSend, IoChatbubbleEllipsesOutline, IoImageOutline } from 'react-icons/io5';

export default function TeacherCheckPage() {
  const params = useParams();
  
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [status, setStatus] = useState('準備中...');

  useEffect(() => {
    if (!params) return;
    const actualId = params.taskId || params.taskid || params.id;
    if (!actualId) return;

    const taskIdString = actualId as string;

    try {
      const q = query(collection(db, "works"), where("taskId", "==", taskIdString));
      const unsub = onSnapshot(q, (snap) => {
        if (snap.empty) {
          setWorks([]);
        } else {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          data.sort((a: any, b: any) => (parseInt(a.studentNumber) || 999) - (parseInt(b.studentNumber) || 999));
          setWorks(data);
        }
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
      return () => unsub();
    } catch (e: any) {
      setLoading(false);
    }
  }, [params]);

  const handleSaveFeedback = async () => {
    if (!selectedWork || !feedbackText.trim()) return;
    try {
      const workRef = doc(db, "works", selectedWork.id);
      await updateDoc(workRef, {
        feedback: feedbackText,
        feedbackAt: serverTimestamp(),
        status: 'checked'
      });
      alert("送信完了！");
      setSelectedWork(null);
      setFeedbackText('');
    } catch (e) {
      alert("保存に失敗しました");
    }
  };

  // 💡 画像URLを取得するための補助関数
  const getImageUrl = (work: any) => {
    if (work.images && work.images.length > 0) return work.images[0]; // 配列の場合
    if (work.image) return work.image; // 単一文字列の場合
    return null; // 画像がない場合
  };

  if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-black">LOADING...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-6 bg-white border-b flex justify-between items-center shadow-sm">
        <Link href="/teacher/check" className="flex items-center text-indigo-500 font-black text-xs uppercase">
          <IoArrowBack className="mr-1" /> Back
        </Link>
        <span className="text-[10px] font-black text-slate-300 uppercase">Review Mode</span>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* 左リスト */}
        <div className="w-1/3 overflow-y-auto p-6 space-y-3 border-r bg-slate-50">
          {works.map((work) => (
            <div 
              key={work.id}
              onClick={() => {
                setSelectedWork(work);
                setFeedbackText(work.feedback || '');
              }}
              className={`p-5 rounded-[24px] cursor-pointer border-4 transition-all ${selectedWork?.id === work.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-white shadow-sm'}`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedWork?.id === work.id ? 'bg-white/20' : 'bg-slate-900 text-white'}`}>
                  {work.studentNumber}
                </span>
                <p className="font-black text-sm">{work.studentName}</p>
              </div>
              {work.status === 'checked' && <IoCheckmarkDone className={selectedWork?.id === work.id ? "text-white" : "text-emerald-500"} size={20} />}
            </div>
          ))}
        </div>

        {/* 右詳細 */}
        <div className="flex-1 overflow-y-auto p-10 bg-white">
          {selectedWork ? (
            <div className="max-w-2xl mx-auto space-y-8">
              
              {/* 💡 画像表示部分の修正 */}
              <div className="relative aspect-[3/4] w-full bg-slate-100 rounded-[40px] overflow-hidden shadow-2xl border-4 border-slate-50">
                {getImageUrl(selectedWork) ? (
                  <img 
                    src={getImageUrl(selectedWork)} 
                    className="w-full h-full object-cover" 
                    alt="work" 
                    style={{ filter: `brightness(${selectedWork.brightness || 1})` }} 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <IoImageOutline size={64} className="mb-4 opacity-20" />
                    <p className="font-black text-xs uppercase tracking-widest opacity-40">No Image Data</p>
                  </div>
                )}
              </div>

              {/* 生徒のコメント */}
              <div className="bg-indigo-50 rounded-[30px] p-6 border-2 border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-500 mb-2">
                  <IoChatbubbleEllipsesOutline size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Student's Comment</span>
                </div>
                <p className="text-slate-700 font-bold leading-relaxed">
                  {selectedWork.comment || "（コメントはありません）"}
                </p>
              </div>

              {/* フィードバック入力 */}
              <div className="bg-slate-900 rounded-[40px] p-8">
                <textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full bg-white/10 border-2 border-white/10 rounded-[24px] p-6 text-white font-bold min-h-[150px] outline-none"
                  placeholder="メッセージを入力..."
                />
                <button onClick={handleSaveFeedback} className="w-full mt-4 bg-indigo-500 text-white py-6 rounded-[24px] font-black uppercase tracking-widest">
                  <IoSend className="inline mr-2" /> Send
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-200 font-black text-4xl uppercase tracking-widest text-center">
              Select<br/>Student
            </div>
          )}
        </div>
      </main>
    </div>
  );
}