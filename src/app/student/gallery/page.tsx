'use client';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase'; 
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { IoSend, IoChatbubbleEllipsesOutline, IoArrowBack } from 'react-icons/io5';

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
  const title = searchParams.get('title');
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 感想機能用の状態
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]); // 今開いている作品の感想リスト

  useEffect(() => {
    // 生徒情報を取得
    const saved = localStorage.getItem('studentInfo');
    if (saved) setStudentInfo(JSON.parse(saved));

    if (!taskId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "works"), where("taskId", "==", taskId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      data.sort((a: any, b: any) => (parseInt(a.studentNumber) || 999) - (parseInt(b.studentNumber) || 999));
      setWorks(data);
      setLoading(false);
    }, (err) => {
      console.error("Firebase Error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [taskId]);

  // 作品が展開されたら、その作品に対する感想をリアルタイム取得
  useEffect(() => {
    if (!expandedId) {
      setComments([]);
      return;
    }

    const q = query(
      collection(db, "comments"),
      where("workId", "==", expandedId),
      orderBy("createdAt", "asc")
    );

    const unsubComments = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubComments();
  }, [expandedId]);

  // 感想を送る
  const sendComment = async (workId: string) => {
    if (!commentText.trim() || !studentInfo) return;

    try {
      await addDoc(collection(db, "comments"), {
        workId: workId,
        senderName: studentInfo.studentName,
        senderNumber: studentInfo.studentNumber,
        text: commentText,
        createdAt: serverTimestamp(),
      });
      setCommentText('');
    } catch (e) {
      console.error(e);
      alert("感想を送れませんでした");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 animate-pulse uppercase tracking-widest">
      ギャラリーを読み込み中...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 font-sans">
      <header className="max-w-2xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <Link href="/student/share" className="text-indigo-500 font-black text-[10px] uppercase tracking-widest mb-3 flex items-center hover:opacity-70 transition-opacity">
            <IoArrowBack className="mr-1" /> 共有メニューに戻る
          </Link>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase mb-1">Task Gallery</span>
            <h1 className="text-3xl font-black tracking-tighter text-slate-800">
              {title || "みんなの作品"}
            </h1>
          </div>
        </div>
        <div className="bg-white px-6 py-2 rounded-2xl shadow-sm border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {works.length} 作品
        </div>
      </header>

      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {works.length === 0 ? (
          <div className="bg-white rounded-[48px] p-24 text-center border-4 border-dashed border-slate-100">
            <p className="text-slate-300 font-black uppercase tracking-widest">まだ投稿がありません。</p>
          </div>
        ) : (
          works.map((work) => {
            const isExpanded = expandedId === work.id;
            return (
              <div 
                key={work.id} 
                className={`bg-white rounded-[40px] shadow-sm border-4 transition-all ${isExpanded ? 'border-indigo-500 -translate-y-1 shadow-xl' : 'border-white hover:border-slate-100'}`}
              >
                {/* クリックで開閉するヘッダーエリア */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : work.id)}
                  className="p-6 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <span className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic text-sm shadow-lg">
                      {work.studentNumber || "??"}
                    </span>
                    <div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">作成者</p>
                      <p className="text-lg font-black text-slate-800">{work.studentName}</p>
                    </div>
                  </div>
                  {!isExpanded && (
                    <img 
                      src={work.images ? work.images[0] : work.image} 
                      className="w-16 h-16 object-cover rounded-[20px] border-2 border-slate-50 shadow-sm" 
                      alt="preview"
                    />
                  )}
                </div>

                {isExpanded && (
                  <div className="px-6 pb-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 gap-6 mb-8 border-t-2 border-slate-50 pt-8">
                      {work.images ? work.images.map((img:string, i:number) => (
                        <img 
                          key={i} 
                          src={img} 
                          style={{ filter: `brightness(${work.brightness || 100}%)` }}
                          className="w-full rounded-[32px] border-4 border-slate-50 shadow-inner" 
                          alt="work"
                        />
                      )) : (
                        <img src={work.image} className="w-full rounded-[32px] border-4 border-slate-50 shadow-inner" alt="work" />
                      )}
                    </div>
                    
                    {/* 本人のこだわりコメント */}
                    <div className="bg-indigo-50 p-8 rounded-[32px] relative overflow-hidden mb-8">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 italic">Artist Message</p>
                      <p className="text-base font-bold text-indigo-900 leading-relaxed">
                        {work.comment ? `“ ${work.comment} ”` : "コメントはありません。"}
                      </p>
                    </div>

                    {/* --- 感想エリア --- */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2">
                        <IoChatbubbleEllipsesOutline className="text-indigo-500" size={20} />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">みんなからの感想</h4>
                      </div>

                      <div className="space-y-3">
                        {comments.map((com) => (
                          <div key={com.id} className="bg-slate-50 p-4 rounded-[24px] ml-2 border-l-4 border-indigo-200">
                            <p className="text-[8px] font-black text-slate-400 uppercase mb-1">
                              {com.senderNumber}番 {com.senderName}
                            </p>
                            <p className="text-sm font-bold text-slate-700">{com.text}</p>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <p className="text-center py-4 text-[10px] font-bold text-slate-300 italic">素敵なところを伝えてみよう！</p>
                        )}
                      </div>

                      {/* 感想入力 */}
                      <div className="pt-4 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="いいな！と思ったところを書こう" 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendComment(work.id)}
                          className="flex-1 bg-slate-100 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                        <button 
                          onClick={() => sendComment(work.id)}
                          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
                        >
                          <IoSend size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}