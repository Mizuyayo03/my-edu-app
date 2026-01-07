'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../../../../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { IoChevronBack, IoGridOutline, IoListOutline, IoCheckmarkCircle, IoTimeOutline, IoImageOutline } from 'react-icons/io5';

// 型定義
interface StudentStatus {
  studentNumber: string;
  studentName: string;
  isSubmitted: boolean;
  workId?: string;
  image?: string;
  portfolioTitle?: string;
}

function GradeDisplayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const classId = searchParams.get('id');
  
  const [className, setClassName] = useState('');
  const [tasks, setTasks] = useState<any[]>([]); // 課題リスト
  const [selectedTaskId, setSelectedTaskId] = useState(''); // 選択中の課題ID
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initFetch() {
      if (!classId) return;
      try {
        // 1. クラス名を取得
        const classDoc = await getDoc(doc(db, "classes", classId));
        if (classDoc.exists()) setClassName(classDoc.data().className);

        // 2. このクラスの課題をすべて取得
        const tasksQuery = query(collection(db, "tasks"), where("classId", "==", classId));
        const tasksSnap = await getDocs(tasksQuery);
        const tasksList = tasksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setTasks(tasksList);

        // 最初の課題をデフォルト選択
        if (tasksList.length > 0) setSelectedTaskId(tasksList[0].id);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    initFetch();
  }, [classId]);

  // 課題が切り替わるたびに提出状況を再取得
  useEffect(() => {
    async function updateStatus() {
      if (!selectedTaskId || !classId) return;
      
      const studentsQuery = query(collection(db, "users"), where("classId", "==", classId));
      const studentsSnap = await getDocs(studentsQuery);
      
      const worksQuery = query(collection(db, "works"), where("taskId", "==", selectedTaskId));
      const worksSnap = await getDocs(worksQuery);
      
      const worksMap = new Map();
      worksSnap.docs.forEach(d => {
        const data = d.data();
        worksMap.set(data.studentName, { id: d.id, ...data });
      });

      const list = studentsSnap.docs.map(d => {
        const s = d.data();
        const work = worksMap.get(s.studentName);
        return {
          studentNumber: s.studentNumber || "0",
          studentName: s.studentName,
          isSubmitted: !!work,
          workId: work?.id,
          image: work?.images?.[0],
          portfolioTitle: work?.portfolioTitle || work?.title
        };
      });
      setStudents(list.sort((a, b) => Number(a.studentNumber) - Number(b.studentNumber)));
    }
    updateStatus();
  }, [selectedTaskId, classId]);

  const submissionRate = students.length > 0 
    ? Math.round((students.filter(s => s.isSubmitted).length / students.length) * 100) 
    : 0;

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-indigo-400 animate-pulse uppercase tracking-widest">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => router.back()} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all">
              <IoChevronBack size={24}/>
            </button>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Grade View</p>
              <h1 className="text-2xl font-black text-slate-800 uppercase italic">{className}</h1>
            </div>
          </div>

          {/* 💡 課題切り替えセレクター */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <select 
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="bg-transparent px-4 py-2 text-xs font-black text-slate-600 outline-none cursor-pointer"
            >
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.unitName})</option>
              ))}
            </select>
          </div>

          {/* 表示切り替えスイッチ */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
              <IoListOutline size={18}/> LIST
            </button>
            <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
              <IoGridOutline size={18}/> WORKS
            </button>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto">
        {/* 💡 さっきの「見やすかった」大きな提出率カード */}
        <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/50 border border-white mb-12 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm mb-2">Submission Rate</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-8xl font-black italic text-slate-800 tracking-tighter leading-none">{submissionRate}</span>
              <span className="text-3xl font-black text-indigo-500 italic">%</span>
            </div>
            <p className="text-slate-400 font-bold mt-4">
              {students.filter(s => s.isSubmitted).length} / {students.length} Students
            </p>
          </div>
          {/* 背景のデコ文字 */}
          <div className="absolute right-[-5%] top-[-20%] text-[200px] font-black italic text-slate-50 opacity-[0.03] select-none uppercase leading-none">
             {submissionRate}%
          </div>
        </div>

        {/* コンテンツ表示（LIST or GRID） */}
        {viewMode === 'list' ? (
          <div className="bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">No.</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((s) => (
                  <tr key={s.studentNumber} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 font-black italic text-slate-300 group-hover:text-indigo-400">{s.studentNumber}</td>
                    <td className="px-8 py-6 font-bold text-slate-700">{s.studentName}</td>
                    <td className="px-8 py-6 text-center">
                      {s.isSubmitted ? (
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <IoCheckmarkCircle size={14}/> Submitted
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <IoTimeOutline size={14}/> Not Yet
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {s.isSubmitted && (
                        <Link href={`/teacher/summary-select/unit/detail/${s.workId}`} className="text-indigo-500 font-black text-xs uppercase tracking-widest hover:underline">
                          View Work →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {students.filter(s => s.isSubmitted).map((s) => (
              <Link key={s.workId} href={`/teacher/summary-select/unit/detail/${s.workId}`}>
                <div className="bg-white rounded-[40px] p-3 shadow-xl hover:-translate-y-2 transition-all border border-white group">
                  <div className="aspect-[4/5] bg-slate-100 rounded-[32px] overflow-hidden mb-4 relative">
                    <img src={s.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-slate-900/80 text-white px-3 py-1 rounded-full text-[10px] font-black">No.{s.studentNumber}</div>
                  </div>
                  <div className="px-3 pb-3">
                    <p className="text-xs font-black text-indigo-500 uppercase truncate">{s.studentName}</p>
                    <p className="text-base font-black text-slate-800 line-clamp-2 italic leading-tight">{s.portfolioTitle || "UNTITLED"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function GradeDisplayPage() {
  return <Suspense><GradeDisplayContent /></Suspense>;
}