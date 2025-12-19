'use client';
import React, { useState } from 'react';
import { db, auth } from '../../../firebase/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function CreateClassPage() {
  const [schoolName, setSchoolName] = useState('');
  const [academicYear, setAcademicYear] = useState('2025');
  const [gradeClass, setGradeClass] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    if (!schoolName || !gradeClass || !auth.currentUser) return alert("すべて入力してください");
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const id = `${auth.currentUser.uid}_${Date.now()}`;
    
    await setDoc(doc(db, "classes", id), {
      schoolName, academicYear, gradeClass, code,
      teacherId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    
    alert("クラスを作成しました！");
    router.push('/teacher'); // 先生トップに戻る
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
      <div className="bg-white w-full max-w-md p-10 rounded-[48px] shadow-2xl border border-slate-100">
        <button onClick={() => router.back()} className="text-slate-300 font-bold text-[10px] mb-4">← CANCEL</button>
        <h2 className="text-3xl font-black mb-8 italic tracking-tighter">NEW CLASS</h2>
        
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">School Name</label>
            <input type="text" placeholder="学校名" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 ring-indigo-400 mt-1" value={schoolName} onChange={e => setSchoolName(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Year</label>
              <input type="text" placeholder="年度" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 ring-indigo-400 mt-1" value={academicYear} onChange={e => setAcademicYear(e.target.value)} />
            </div>
            <div className="flex-[2]">
              <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Grade / Class</label>
              <input type="text" placeholder="学年・組" className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 ring-indigo-400 mt-1" value={gradeClass} onChange={e => setGradeClass(e.target.value)} />
            </div>
          </div>
          
          <button onClick={handleCreate} className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black text-xl shadow-xl hover:bg-black transition-all active:scale-95 mt-4">
            作成する
          </button>
        </div>
      </div>
    </div>
  );
}