'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../../../../firebase/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { IoChevronBack, IoCheckmarkCircleOutline } from 'react-icons/io5';

export default function CameraShare() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');

  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else router.push('/teacher/login');
    });

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("カメラの起動に失敗しました。ブラウザの設定で許可してください。");
      }
    }
    setupCamera();

    return () => unsub();
  }, [router]);

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // 🚀 ここが重要：保存サイズを強制的に小さくする (例: 横幅最大 800px)
    const maxWidth = 800;
    const scale = maxWidth / video.videoWidth;
    canvas.width = maxWidth;
    canvas.height = video.videoHeight * scale;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      // 🚀 画質を 0.4 (40%) まで落としてデータ量を劇的に減らす
      const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
      setCapturedImage(dataUrl);
    }
  };

  const handleSubmit = async () => {
    if (!capturedImage || !title || !user || !classId) return alert("タイトルを入力してください");

    setLoading(true);
    try {
      // 文字列の長さをチェック (Firestoreの制限は約1MB = 1,000,000文字弱)
      if (capturedImage.length > 1000000) {
        throw new Error("画像サイズが大きすぎます。画質を下げてください。");
      }

      await addDoc(collection(db, "shared_resources"), {
        title: title,
        imageUrl: capturedImage,
        classId: classId,
        teacherId: user.uid,
        type: 'camera',
        createdAt: serverTimestamp(),
      });

      alert("共有しました！");
      router.push('/teacher/gallery-select');
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました。タイトルが長すぎるか、画像が大きすぎます。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="p-6 flex justify-between items-center bg-black/20">
        <button onClick={() => router.back()} className="flex items-center gap-1 font-bold text-xs">
          <IoChevronBack size={24} /> BACK
        </button>
        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Camera</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!capturedImage ? (
          <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-[40px] overflow-hidden border-4 border-white/10">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <button onClick={takePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-white/30 active:scale-90 shadow-xl" />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            <div className="relative aspect-[3/4] bg-black rounded-[40px] overflow-hidden border-4 border-indigo-500">
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              <button onClick={() => setCapturedImage(null)} className="absolute top-4 right-4 bg-black/50 px-4 py-2 rounded-full text-xs font-black">RETAKE</button>
            </div>
            <input 
              type="text" 
              placeholder="タイトルを入力..." 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-6 bg-white/10 rounded-[30px] font-black text-lg border-2 border-white/10 text-center outline-none focus:border-indigo-500" 
            />
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-6 bg-indigo-600 text-white rounded-[40px] font-black text-xl shadow-xl flex items-center justify-center gap-3"
            >
              <IoCheckmarkCircleOutline size={24} />
              {loading ? "SENDING..." : "SHARE TO CLASS"}
            </button>
          </div>
        )}
      </main>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}