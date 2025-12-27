'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../../firebase/firebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoImagesOutline, IoChevronBack, IoCheckmarkCircleOutline } from 'react-icons/io5';

export default function ShareFromStudents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');

  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else router.push('/teacher/login');
    });

    if (classId) {
      // 1. このクラスに紐づく課題箱を取得
      const qTasks = query(collection(db, "tasks"), where("classId", "==", classId));
      const unsubTasks = onSnapshot(qTasks, (snap) => {
        setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => { unsub(); unsubTasks(); };
    }
    return () => unsub();
  }, [classId, router]);

  // 課題箱が選ばれたら、その提出物を取得
  useEffect(() => {
    if (!selectedTaskId) {
      setSubmissions([]);
      return;
    }
    // 実際には submissions コレクションから taskId で絞り込む
    const qSubs = query(collection(db, "submissions"), where("taskId", "==", selectedTaskId));
    const unsubSubs = onSnapshot(qSubs, (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubSubs();
  }, [selectedTaskId]);

  const handleShare = async (sub: any) => {
    if (!user || !classId) return;
    
    setLoading(true);
    try {
      // 🚀 選んだ生徒の作品データを「shared_resources」にコピー
      await addDoc(collection(db, "shared_resources"), {
        title: `${sub.studentName}さんの作品`,
        imageUrl: sub.imageUrl, // 生徒が提出した画像URL(またはBase64)
        classId: classId,
        teacherId: user.uid,
        type: 'student_work',
        createdAt: serverTimestamp(),
      });

      alert("生徒の作品を共有資料に設定しました！");
      router.push('/teacher/gallery-select');
    } catch (error) {
      alert("共有に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 text-slate-900">
      <header className="max-w-4xl mx-auto mb-10 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold text-xs">
          <IoChevronBack size={20} /> BACK
        </button>
        <h1 className="text-xl font-black italic text-indigo-600 uppercase">Share Student Work</h1>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* 課題の選択 */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-2">Step 2: Select Task Box</label>
          <select 
            value={selectedTaskId} 
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none"
          >
            <option value="">課題箱を選択してください</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title} - {t.unitName}</option>
            ))}
          </select>
        </div>

        {/* 提出物一覧 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white p-3 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-3">
              <div className="aspect-square rounded-[24px] overflow-hidden bg-slate-100">
                <img src={sub.imageUrl} alt="Submission" className="w-full h-full object-cover" />
              </div>
              <div className="px-2">
                <p className="text-[10px] font-black text-slate-400 uppercase">{sub.studentNumber}番</p>
                <p className="font-bold text-sm truncate">{sub.studentName}</p>
              </div>
              <button 
                onClick={() => handleShare(sub)}
                disabled={loading}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-colors"
              >
                この作品を共有
              </button>
            </div>
          ))}
        </div>

        {selectedTaskId && submissions.length === 0 && (
          <p className="text-center py-20 text-slate-300 font-bold italic">まだ提出物がありません</p>
        )}
      </main>
    </div>
  );
}