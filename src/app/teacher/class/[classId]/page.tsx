'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { IoCloudUploadOutline, IoTrashOutline, IoArrowBackOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

export default function ClassStudentManager() {
  const params = useParams();
  const classId = params.classId as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const className = searchParams.get('name');
  
  const [students, setStudents] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);

  // 1. リアルタイム監視：このクラスIDを持つデータだけを表示
  useEffect(() => {
    if (!classId) return;
    const q = query(collection(db, "users"), where("classId", "==", classId));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a: any, b: any) => (parseInt(a.studentNumber) || 999) - (parseInt(b.studentNumber) || 999));
      setStudents(data);
    });
    return () => unsub();
  }, [classId]);

  // 2. エクセル登録処理（クラスコードは使わず直接登録）
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !classId) return;

    setIsProcessing(true);
    setImportResults([]);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws) as any[];
        const results: any[] = [];

        for (const row of data) {
          const email = row['メールアドレス'] || row['email'];
          const name = row['名前'] || row['name'];
          const number = row['出席番号'] || row['number'];
          if (!email) continue;

          try {
            // 🚀 addDocを使うことで、同じメールアドレスでも複数クラスに登録可能
            await addDoc(collection(db, "users"), {
              email: email.trim().toLowerCase(),
              studentName: name,
              studentNumber: String(number),
              classId: classId, // このクラスIDに直接紐付け
              role: 'student',
              createdAt: serverTimestamp()
            });
            results.push({ name, email, status: 'SUCCESS' });
          } catch (err: any) {
            results.push({ name, status: 'ERROR', message: err.message });
          }
        }
        setImportResults(results);
        alert("クラスへの登録が完了しました。");
      } catch (err: any) {
        alert("読み込みエラー: " + err.message);
      } finally {
        setIsProcessing(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (docId: string, name: string) => {
    if (!confirm(`生徒「${name}」の登録を削除しますか？`)) return;
    try { 
      await deleteDoc(doc(db, "users", docId)); 
    } catch (err) { 
      alert("削除失敗"); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 font-sans text-slate-900">
      <header className="max-w-2xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/teacher')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-900 hover:text-white transition-all text-xl">
            <IoArrowBackOutline />
          </button>
          <div>
            <h1 className="text-2xl font-black italic uppercase text-slate-800">{className || 'Class Manager'}</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Student List</p>
          </div>
        </div>
        <label className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase cursor-pointer hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg">
          <IoCloudUploadOutline className="text-base" />
          {isProcessing ? 'Processing...' : 'Excel Import'}
          <input type="file" className="hidden" onChange={handleImport} accept=".xlsx, .xls, .csv" disabled={isProcessing} />
        </label>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {importResults.length > 0 && (
          <div className="bg-white rounded-[30px] shadow-xl border-4 border-indigo-500 overflow-hidden">
            <div className="p-4 bg-indigo-500 text-white flex justify-between items-center text-xs font-black uppercase">
              <span>Import Results</span>
              <button onClick={() => setImportResults([])}>Close</button>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto divide-y divide-slate-100">
              {importResults.map((res, i) => (
                <div key={i} className="flex justify-between py-2 text-sm italic">
                  <span className="font-bold">{res.name}</span>
                  <span className="text-indigo-500 text-[10px]">{res.email}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {students.map((s) => (
            <div key={s.id} className="bg-white p-5 rounded-[24px] shadow-sm flex justify-between items-center border border-transparent hover:border-indigo-200">
              <div className="flex items-center gap-5">
                <span className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs italic">{s.studentNumber}</span>
                <div>
                  <p className="font-black text-slate-800 text-lg leading-tight">{s.studentName}</p>
                  <p className="text-[10px] font-mono text-indigo-500 font-bold mt-1">{s.email}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id, s.studentName)} className="p-2 text-slate-200 hover:text-rose-500 transition-all">
                <IoTrashOutline className="text-xl" />
              </button>
            </div>
          ))}
          {students.length === 0 && !isProcessing && (
            <div className="bg-white p-20 rounded-[40px] text-center border-4 border-dashed border-slate-100 font-black text-slate-300 uppercase italic">No Students</div>
          )}
        </div>
      </div>
    </div>
  );
}