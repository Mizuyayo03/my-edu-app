'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { db } from '../../../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { IoCloudUploadOutline, IoTrashOutline, IoArrowBackOutline, IoCheckmarkCircleOutline, IoWarningOutline } from 'react-icons/io5';

export default function ClassStudentManager() {
  const params = useParams();
  const classId = params.classId as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const className = searchParams.get('name');
  
  const [students, setStudents] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<any[]>([]);

  // 1. リアルタイム監視
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

  // 2. エクセル登録処理 (Google連携用にAuth作成をスキップ)
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
            // 🚀 変更点：Authのアカウントは作成せず、Firestoreに「許可リスト」として保存
            // IDはメールアドレスにすることで、ログイン時に照合しやすくします
            await setDoc(doc(db, "users", email), {
              email: email,
              studentName: name,
              studentNumber: String(number),
              classId: classId,
              role: 'student',
              authMethod: 'google', // 識別用
              createdAt: serverTimestamp()
            });

            results.push({ name, email, status: 'SUCCESS' });
          } catch (err: any) {
            console.error(`❌ ${name} の登録エラー:`, err.message);
            results.push({ name, status: 'ERROR', message: err.message });
          }
        }
        
        setImportResults(results);
        alert("許可リストの登録が完了しました。生徒はGoogleアカウントでログインできます。");
      } catch (err: any) {
        alert("エラー: " + err.message);
      } finally {
        setIsProcessing(false);
        e.target.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDelete = async (studentUid: string, name: string) => {
    if (!confirm(`生徒「${name}」の許可を取り消しますか？`)) return;
    try { 
      // IDがメールアドレスになっているので、渡されたIDで削除
      await deleteDoc(doc(db, "users", studentUid)); 
    } catch (err) { 
      alert("削除失敗"); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 font-sans text-slate-900">
      <header className="max-w-2xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/teacher')} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-900 hover:text-white transition-all text-xl"><IoArrowBackOutline /></button>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-800">{className || 'Class Manager'}</h1>
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Google Auth Registration</p>
          </div>
        </div>
        <label className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase cursor-pointer hover:bg-slate-900 transition-all flex items-center gap-2 shadow-lg shadow-indigo-100">
          <IoCloudUploadOutline className="text-base" />
          {isProcessing ? 'Processing...' : 'Import Students'}
          <input type="file" className="hidden" onChange={handleImport} accept=".xlsx, .xls, .csv" disabled={isProcessing} />
        </label>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* インポート結果プレビュー */}
        {importResults.length > 0 && (
          <div className="bg-white rounded-[40px] shadow-2xl border-4 border-indigo-500 overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 bg-indigo-500 text-white flex justify-between items-center">
              <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><IoCheckmarkCircleOutline /> Added to Allowed List</p>
              <button onClick={() => setImportResults([])} className="text-[10px] font-bold bg-white/20 px-3 py-1 rounded-full uppercase">Close</button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto divide-y divide-slate-50">
              {importResults.map((res, i) => (
                <div key={i} className="flex justify-between py-3 text-sm">
                  <span className="font-black">{res.name}</span>
                  {res.status === 'SUCCESS' ? (
                    <span className="text-indigo-500 font-mono font-bold text-[10px]">{res.email}</span>
                  ) : (
                    <span className="text-rose-500 font-bold text-[10px]">{res.message}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 生徒一覧リスト */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Authorized Student List</p>
          {students.length === 0 ? (
            <div className="bg-white p-20 rounded-[40px] text-center border-4 border-dashed border-slate-200">
              <p className="font-black text-slate-300 italic uppercase tracking-widest">No students registered.</p>
            </div>
          ) : (
            students.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-5">
                  <span className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black italic text-sm shadow-md">{s.studentNumber}</span>
                  <div>
                    <p className="font-black text-slate-800 text-lg leading-tight">{s.studentName}</p>
                    <p className="text-[10px] font-mono text-indigo-500 font-bold mt-1">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase border border-slate-100 px-2 py-1 rounded-lg">Google Auth</span>
                  <button onClick={() => handleDelete(s.id, s.studentName)} className="p-2 text-slate-200 hover:text-rose-500 transition-all"><IoTrashOutline className="text-xl" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}