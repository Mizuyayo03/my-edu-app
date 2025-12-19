'use client';
import React, { useState, useEffect } from 'react';
import { db } from '../../../../firebase/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { IoArrowBack, IoSchoolOutline, IoPersonOutline, IoImageOutline } from 'react-icons/io5';

export default function GradePortfolioPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  // 選択状態の管理
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // クラス一覧、作品、課題箱をすべて取得
    const unsubClasses = onSnapshot(collection(db, "classes"), (snap) => {
      setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubWorks = onSnapshot(collection(db, "works"), (snap) => {
      setWorks(snap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
    });
    const unsubTasks = onSnapshot(collection(db, "tasks"), (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => { unsubClasses(); unsubWorks(); unsubTasks(); };
  }, []);

  // 特定のクラスに所属するユニークな生徒リストを作成
  const studentsInClass = Array.from(
    new Set(works.filter(w => w.classId === selectedClass).map(w => w.studentName))
  ).map(name => {
    const work = works.find(w => w.studentName === name);
    return { name, studentNumber: work?.studentNumber };
  }).sort((a, b) => Number(a.studentNumber) - Number(b.studentNumber));

  // 特定の生徒の全提出作品
  const studentWorks = works
    .filter(w => w.studentName === selectedStudent && w.classId === selectedClass)
    .map(w => ({
      ...w,
      taskTitle: tasks.find(t => t.id === w.taskId)?.title || "不明な課題"
    }));

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-black text-slate-200 animate-pulse uppercase tracking-[0.3em]">Loading Grade Data...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans text-slate-900">
      <header className="max-w-6xl mx-auto mb-12 flex items-center gap-8">
        <button 
          onClick={() => {
            if (selectedStudent) setSelectedStudent(null);
            else if (selectedClass) setSelectedClass(null);
            else window.location.href = "/teacher/summary-select";
          }}
          className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-white group"
        >
          <span className="text-3xl font-black text-slate-200 group-hover:text-indigo-600">←</span>
        </button>
        <div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-1">Grade Archive</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800">
            {selectedStudent ? selectedStudent : selectedClass ? "Select Student" : "Select Class"}
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {/* STEP 1: クラス一覧表示 */}
        {!selectedClass && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {classes.map(c => (
              <button key={c.id} onClick={() => setSelectedClass(c.id)} className="group bg-white p-10 rounded-[48px] shadow-sm border border-white hover:border-indigo-200 transition-all text-left relative overflow-hidden">
                <IoSchoolOutline className="absolute -right-4 -bottom-4 text-8xl text-slate-50 group-hover:text-indigo-50 transition-colors" />
                <h2 className="text-3xl font-black text-slate-800 italic uppercase mb-2">{c.name}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View this classroom ➔</p>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: 生徒一覧表示 */}
        {selectedClass && !selectedStudent && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {studentsInClass.map(s => (
              <button key={s.name} onClick={() => setSelectedStudent(s.name)} className="bg-white p-6 rounded-[32px] shadow-sm border border-white hover:shadow-md hover:scale-[1.02] transition-all text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <IoPersonOutline className="text-xl" />
                </div>
                <p className="text-[10px] font-black text-indigo-400 mb-1">No.{s.studentNumber}</p>
                <h3 className="font-black text-slate-700">{s.name}</h3>
              </button>
            ))}
          </div>
        )}

        {/* STEP 3: 生徒の個人作品一覧（ポートフォリオ） */}
        {selectedStudent && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {studentWorks.map(work => (
              <div key={work.id} className="space-y-4 animate-in zoom-in duration-500">
                <div className="aspect-[3/4] bg-white rounded-[40px] overflow-hidden shadow-xl border-[8px] border-white">
                  <img src={work.images?.[0]} className="w-full h-full object-cover" />
                </div>
                <div className="px-4">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{work.taskTitle}</p>
                  <p className="text-xs font-bold text-slate-400 italic uppercase">{new Date(work.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}