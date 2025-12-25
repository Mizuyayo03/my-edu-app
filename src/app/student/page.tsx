'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoLogOutOutline, IoEnterOutline, IoCameraOutline, IoShareSocialOutline, IoTimeOutline, IoChevronDownOutline } from 'react-icons/io5';

export default function StudentStartPage() {
  const [user, setUser] = useState<any>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [myClasses, setMyClasses] = useState<any[]>([]); 
  const [currentClass, setCurrentClass] = useState<any>(null); 
  const [showClassList, setShowClassList] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        if (u.email) {
          try {
            // 1. クラス所属情報をすべて取得
            // 💡 先生側で doc(db, "users", email) ではなく addDoc(collection(db, "users"), ...) 
            // で登録するようにすると、ここで複数のクラスがヒットするようになります。
            const q = query(collection(db, "users"), where("email", "==", u.email));
            const querySnapshot = await getDocs(q);
            
            const classesFound: any[] = [];
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data();
              if (data.classId) {
                // 🚀 クラス名を「学校名 学年・組」で組み立てる
                const displayName = (data.schoolName && data.gradeClass)
                  ? `${data.schoolName} ${data.gradeClass}`
                  : data.className || data.classId;

                classesFound.push({
                  id: docSnap.id,
                  classId: data.classId,
                  displayName: displayName,
                  studentName: data.studentName
                });
              }
            });

            setMyClasses(classesFound);
            
            if (classesFound.length > 0) {
              setCurrentClass(classesFound[0]);
              setStudentName(classesFound[0].studentName || '');
            }
          } catch (err) {
            console.error("データ取得失敗:", err);
          }
        }
      } else {
        router.push('/student/login');
      }
    });
    return () => unsub();
  }, [router]);

  // クラスを切り替えた時に名前も更新する
  const handleSelectClass = (cls: any) => {
    setCurrentClass(cls);
    setStudentName(cls.studentName || '');
    setShowClassList(false);
  };

  if (!user) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-indigo-50 text-slate-900 flex flex-col font-sans">
      <nav className="p-6 px-10 flex justify-between items-center bg-white shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-black italic tracking-tighter text-indigo-600">
          {studentName ? `${studentName} さん` : 'マイページ'}
        </h1>
        
        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => setShowClassList(!showClassList)}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-indigo-100 transition-all flex items-center gap-2 border border-slate-200"
          >
            <span className="text-indigo-600 font-bold">所属:</span> 
            {currentClass ? currentClass.displayName : '未所属'}
            <IoChevronDownOutline className={`transition-transform ${showClassList ? 'rotate-180' : ''}`} />
          </button>
          
          <button onClick={() => signOut(auth)} className="text-slate-300 font-bold text-[10px] hover:text-rose-500 uppercase tracking-widest">ログアウト</button>

          {/* ドロップダウンメニュー */}
          {showClassList && (
            <div className="absolute top-12 right-0 w-64 bg-white rounded-3xl shadow-2xl border border-indigo-50 p-2 z-50 animate-in fade-in zoom-in duration-150">
              <p className="text-[9px] font-black text-slate-400 p-3 uppercase tracking-widest">参加中のクラス</p>
              {myClasses.length === 0 && <p className="p-4 text-xs font-bold text-slate-300">クラスがありません</p>}
              {myClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleSelectClass(cls)}
                  className={`w-full text-left p-4 rounded-2xl font-black text-sm transition-all mb-1 ${
                    currentClass?.id === cls.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'hover:bg-indigo-50 text-slate-700'
                  }`}
                >
                  {cls.displayName}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <div className="text-center mb-2">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">選択中のクラス</p>
          <h2 className="text-2xl font-black text-slate-800 italic">{currentClass ? currentClass.displayName : 'クラスを選択してください'}</h2>
        </div>

        {/* 作品を撮る */}
        <Link 
          href={currentClass ? `/student/upload?classId=${currentClass.classId}&studentName=${studentName}` : '#'} 
          className={`w-full group p-10 rounded-[40px] shadow-xl transition-all flex flex-col items-center justify-center text-center ${
            currentClass ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 pointer-events-none'
          }`}
        >
          <IoCameraOutline className="text-5xl mb-4 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter uppercase">作品を撮る</span>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-2">カメラで写真を送る</p>
        </Link>

        {/* みんなのギャラリー */}
        <Link 
          href={currentClass ? `/student/share?classId=${currentClass.classId}` : '#'} 
          className="w-full group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-white hover:border-indigo-100 transition-all flex flex-col items-center justify-center text-center"
        >
          <IoShareSocialOutline className="text-5xl mb-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">みんなのギャラリー</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">ともだちの作品を見る</p>
        </Link>

        {/* 自分の記録 */}
        <Link href="/student/history" className="w-full group bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-white hover:border-indigo-100 transition-all flex flex-col items-center justify-center text-center">
          <IoTimeOutline className="text-5xl mb-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">自分の記録</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">これまでの活動を見る</p>
        </Link>
      </main>

      <footer className="p-10 text-center">
        <p className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.5em]">COLORVERSE SYSTEM</p>
      </footer>
    </div>
  );
}