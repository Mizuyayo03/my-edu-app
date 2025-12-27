'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../../firebase/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { IoLinkOutline, IoChevronBack, IoImageOutline } from 'react-icons/io5';

export default function ResourceUrlShare() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get('classId');

  const [user, setUser] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // FileではなくURLを入れる
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else router.push('/teacher/login');
    });
    return () => unsub();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !title || !user || !classId) return alert("タイトルと画像URLが必要です");

    setLoading(true);
    try {
      // 🚀 Storageを使わず、FirestoreにURLを直接保存するだけ！
      await addDoc(collection(db, "shared_resources"), {
        title: title,
        imageUrl: imageUrl, // 入力したURLをそのまま保存
        classId: classId,
        teacherId: user.uid,
        type: 'url', 
        createdAt: serverTimestamp(),
      });

      alert("生徒に共有しました！");
      router.push('/teacher/gallery-select');
    } catch (error) {
      alert("共有に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <header className="max-w-md mx-auto mb-10 flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
          <IoChevronBack size={20} /> Back
        </button>
        <h1 className="text-xl font-black italic text-indigo-600 uppercase tracking-tighter">Share Image URL</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-8">
        {/* URL入力エリア */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Image URL</label>
          <input 
            type="text" 
            placeholder="https://example.com/image.jpg" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
            className="w-full p-6 bg-white rounded-[32px] font-medium text-sm border-none shadow-sm focus:ring-2 focus:ring-indigo-500" 
          />
          {imageUrl && (
            <div className="mt-4 rounded-[32px] overflow-hidden border-2 border-slate-200">
              <img src={imageUrl} alt="Preview" className="w-full h-auto" onError={() => console.log("Invalid URL")} />
            </div>
          )}
        </div>

        {/* タイトル入力 */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Resource Title</label>
          <input 
            type="text" 
            placeholder="例：参考作品のURL" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full p-6 bg-white rounded-[32px] font-black text-lg border-none shadow-sm focus:ring-2 focus:ring-indigo-500" 
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-7 bg-slate-900 text-white rounded-[40px] font-black italic text-2xl shadow-2xl active:scale-[0.98]"
        >
          {loading ? "SHARING..." : "SHARE TO CLASS"}
        </button>
      </form>
    </div>
  );
}