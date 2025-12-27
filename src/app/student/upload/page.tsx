'use client';
import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../../firebase/firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const [step, setStep] = useState<'shoot' | 'preview'>('shoot');
  const [images, setImages] = useState<string[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [submittedTaskIds, setSubmittedTaskIds] = useState<string[]>([]);
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [comment, setComment] = useState('');
  const [brightness, setBrightness] = useState(100);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { 
      if (u) {
        setUser(u);
        const q = query(collection(db, "works"), where("uid", "==", u.uid));
        const unsubWorks = onSnapshot(q, (snap) => {
          setSubmittedTaskIds(snap.docs.map(doc => doc.data().taskId));
        });
        return () => unsubWorks();
      }
    });
    const savedName = localStorage.getItem('art_student_name');
    const savedNumber = localStorage.getItem('art_student_number');
    if (savedName) setStudentName(savedName);
    if (savedNumber) setStudentNumber(savedNumber);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!classId) return;
    const q = query(collection(db, "tasks"), where("classId", "==", classId));
    const unsub = onSnapshot(q, (snap) => {
      const now = new Date().getTime();
      const allTasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      const filtered = allTasks.filter(task => {
        if (submittedTaskIds.includes(task.id)) return false;
        if (!task.deadline) return true;
        try {
          const deadlineTime = task.deadline.seconds ? task.deadline.seconds * 1000 : new Date(task.deadline).getTime();
          return deadlineTime > now;
        } catch (e) { return true; }
      });
      filtered.sort((a, b) => (a.deadline?.seconds || 0) - (b.deadline?.seconds || 0));
      setTasks(filtered);
      if (filtered.length > 0 && !selectedTaskId) {
        setSelectedTaskId(filtered[0].id);
        setTaskName(filtered[0].title);
      }
    });
    return () => unsub();
  }, [submittedTaskIds, classId]);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error(err); }
    };
    const stopCamera = () => {
      if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    };
    if (step === 'shoot') startCamera();
    else stopCamera();
    return () => stopCamera();
  }, [step]);

  const takePhoto = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (v && c) {
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext('2d')?.drawImage(v, 0, 0);
      setImages(prev => [...prev, c.toDataURL('image/jpeg')]);
    }
  };

  const handleSubmit = async () => {
    if (!studentName || !studentNumber) return alert("名前と出席番号を入力してください");
    if (!selectedTaskId || images.length === 0) return alert("提出先の課題箱を選択してください");
    setLoading(true);
    try {
      localStorage.setItem('art_student_name', studentName);
      localStorage.setItem('art_student_number', studentNumber);
      await addDoc(collection(db, "works"), {
        uid: user.uid, 
        studentName, 
        studentNumber, 
        images, // 複数枚対応
        taskId: selectedTaskId,
        taskName, 
        classId,
        comment, 
        brightness: brightness / 100, // 先生側で計算しやすいように1.0基準にする
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      alert("提出完了しました！");
      router.push('/student');
    } catch (err) { alert("送信エラー"); } finally { setLoading(false); }
  };

  if (step === 'shoot') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        <header className="p-4 flex justify-between items-center absolute top-0 w-full z-10 bg-black/40 backdrop-blur-md">
          <Link href="/student" className="text-sm font-black px-6 py-2 bg-white/10 rounded-full border border-white/20 uppercase">キャンセル</Link>
          <div className="px-4 py-1 rounded-full text-xs font-black bg-indigo-600 shadow-lg shadow-indigo-500/50">枚数: {images.length}</div>
        </header>
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-10 flex items-center justify-center w-full gap-8">
            <button onClick={takePhoto} className="w-24 h-24 bg-white rounded-full border-[10px] border-white/30 active:scale-90 transition-transform shadow-2xl" />
          </div>
        </div>
        <div className="h-32 bg-zinc-900 p-4 flex gap-3 overflow-x-auto items-center border-t border-white/10">
          {images.map((img, i) => (
            <div key={i} className="relative flex-shrink-0 animate-in zoom-in duration-300">
              <img src={img} className="w-20 h-20 object-cover rounded-2xl border-2 border-white/10" alt="thumbnail" />
              <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg">✕</button>
            </div>
          ))}
          {images.length > 0 && (
            <button onClick={() => setStep('preview')} className="ml-auto bg-indigo-600 px-10 py-5 rounded-[24px] font-black text-sm shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-95 transition-all">プレビューへ →</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 text-slate-900 font-sans">
      <header className="max-w-md mx-auto mb-8 flex justify-between items-center">
        <button onClick={() => setStep('shoot')} className="text-xs font-black text-slate-400 underline decoration-slate-200 underline-offset-4 uppercase tracking-tighter">← 撮り直す</button>
        <h1 className="text-2xl font-black italic tracking-tighter text-slate-800">PREVIEW</h1>
        <div className="w-10" />
      </header>
      <div className="max-w-md mx-auto space-y-8 pb-24">
        <div className="flex gap-4 overflow-x-auto py-2 snap-x px-2">
          {images.map((img, i) => (
            <img key={i} src={img} style={{ filter: `brightness(${brightness}%)` }} className="h-72 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[6px] border-white flex-shrink-0 snap-center transition-all" alt="preview" />
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4 bg-white p-5 rounded-[32px] shadow-sm border border-slate-100">
          <div className="col-span-1 border-r border-slate-100 pr-2">
            <label className="text-[10px] font-black text-slate-300 block mb-1 tracking-widest uppercase">番号</label>
            <input type="number" placeholder="00" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} className="w-full bg-transparent font-black text-2xl p-0 border-none focus:ring-0 placeholder:text-slate-100" />
          </div>
          <div className="col-span-3">
            <label className="text-[10px] font-black text-slate-300 block mb-1 tracking-widest uppercase">お名前</label>
            <input type="text" placeholder="名前を入力" value={studentName} onChange={(e) => setStudentName(e.target.value)} className="w-full bg-transparent font-black text-2xl p-0 border-none focus:ring-0 placeholder:text-slate-100" />
          </div>
        </div>

        <div className="bg-white p-7 rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4 px-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">明るさ調整</label>
            <span className="text-xs font-black text-indigo-600">{brightness} %</span>
          </div>
          <input type="range" min="50" max="150" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em] italic">提出先の課題箱を選んでね</label>
          <div className="grid gap-3">
            {tasks.length > 0 ? tasks.map((t) => (
              <button key={t.id} onClick={() => { setSelectedTaskId(t.id); setTaskName(t.title); }} 
                className={`p-6 rounded-[32px] text-left font-black transition-all border-4 ${selectedTaskId === t.id ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xl -translate-y-1' : 'border-white bg-white shadow-sm text-slate-400 opacity-60'}`}>
                <div className="flex flex-col gap-1">
                  {t.unitName && <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{t.unitName}</span>}
                  <div className="flex justify-between items-center">
                    <span className="text-lg">{t.title}</span>
                    {selectedTaskId === t.id && <span className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse" />}
                  </div>
                </div>
              </button>
            )) : <div className="p-12 text-center text-sm font-bold text-slate-300 bg-white rounded-[40px] border-4 border-dashed border-slate-50 italic">提出可能な課題はありません</div>}
          </div>
        </div>

        <textarea placeholder="作品についてのメッセージ（空欄でもOK）" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-8 bg-white rounded-[40px] font-bold shadow-sm h-40 border-none focus:ring-4 focus:ring-indigo-50/50 text-slate-700 placeholder:text-slate-200" />
        
        <button onClick={handleSubmit} disabled={loading || tasks.length === 0} className="w-full py-7 bg-slate-900 text-white rounded-[48px] font-black italic text-3xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] active:scale-95 disabled:bg-slate-200 disabled:shadow-none transition-all uppercase tracking-tighter">
          {loading ? "送信中..." : "作品を提出する"}
        </button>
      </div>
    </div>
  );
}