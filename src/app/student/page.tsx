'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoCameraOutline, IoShareSocialOutline, IoTimeOutline, IoChevronDownOutline } from 'react-icons/io5';

// --- 型定義 (Interfaces) ---
// 生徒情報のデータの形を定義します
interface StudentProfile {
  studentName: string;
  email: string;
  classId: string;
}

// 画面で使うクラス情報の形を定義します
interface DisplayClass {
  id: string;        // FirestoreのドキュメントID
  classId: string;   // クラス自体のID
  displayName: string;
}

export default function StudentStartPage() {
  // <any> を使わず、定義した型を指定します
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [myClasses, setMyClasses] = useState<DisplayClass[]>([]);
  const [currentClass, setCurrentClass] = useState<DisplayClass | null>(null);
  const [showClassList, setShowClassList] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // ログイン状態を監視
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        // ログインしていなければログインページへ
        router.push('/student/login');
        return;
      }
      
      setUser(u);
      
      if (u.email) {
        try {
          const emailLower = u.email.toLowerCase().trim();
          
          // 1. usersコレクションから、このメアドに紐づくドキュメントを取得
          const q = query(collection(db, "users"), where("email", "==", emailLower));
          const snap = await getDocs(q);
          
          if (snap.empty) {
            console.warn("名簿に登録がないメアド:", emailLower);
            setMyClasses([]);
            setLoading(false);
            return;
          }

          let foundName = "";
          
          // 2. 所属している全クラスの情報を取得
          const classPromises = snap.docs.map(async (userDoc) => {
            const userData = userDoc.data() as StudentProfile; // 型を当てはめる
            if (!foundName) foundName = userData.studentName;

            if (userData.classId) {
              const classRef = doc(db, "classes", userData.classId);
              const classSnap = await getDoc(classRef);
              
              if (classSnap.exists()) {
                const cData = classSnap.data();
                return {
                  id: userDoc.id,
                  classId: userData.classId,
                  displayName: cData.className || cData.gradeClass || "無題のクラス"
                };
              }
            }
            return null;
          });

          // nullを除外して結果を確定させる
          const results = (await Promise.all(classPromises)).filter((c): c is DisplayClass => c !== null);
          
          setStudentName(foundName);
          setMyClasses(results);
          
          if (results.length > 0) {
            setCurrentClass(results[0]);
          }
        } catch (err) {
          console.error("データ取得エラー:", err);
          alert("データの読み込みに失敗しました。電波の良いところで再度お試しください。");
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // --- 画面表示 (UI) ---

  // 読み込み中
  if (loading) return (
    <div className="min-h-screen bg-indigo-50 flex items-center justify-center font-black text-slate-400">
      読み込み中...
    </div>
  );

  // クラスが見つからない場合
  if (myClasses.length === 0) {
    return (
      <div className="min-h-screen bg-indigo-50 flex flex-col items-center justify-center p-10 text-center">
        <div className="bg-white p-10 rounded-[40px] shadow-xl max-w-sm w-full border-t-8 border-rose-500">
          <h2 className="text-xl font-black text-slate-800 mb-4 italic text-rose-500">CLASS NOT FOUND</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6 font-bold">
            先生の画面には登録されていますが、<br/>
            生徒側の「クラス情報」との接続に失敗しました。
          </p>
          <div className="text-[10px] font-mono bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 break-all mb-6">
            <p className="text-slate-400 uppercase mb-1 font-black">Logged in as:</p>
            <p className="font-bold text-indigo-600">{user?.email}</p>
          </div>
          <button onClick={() => signOut(auth)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
            ログアウト
          </button>
        </div>
      </div>
    );
  }

  // メイン画面
  return (
    <div className="min-h-screen bg-indigo-50 text-slate-900 flex flex-col font-sans">
      <nav className="p-6 px-10 flex justify-between items-center bg-white shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-black italic tracking-tighter text-indigo-600">
          {studentName} さん
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowClassList(!showClassList)} 
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-black text-[11px] uppercase flex items-center gap-2 border border-slate-200"
          >
            <span className="text-indigo-600">所属:</span>
            {currentClass?.displayName}
            <IoChevronDownOutline className={showClassList ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          <button 
            onClick={() => signOut(auth)} 
            className="text-slate-300 font-bold text-[10px] hover:text-rose-500 uppercase tracking-widest transition-all"
          >
            ログアウト
          </button>
        </div>

        {/* クラス切り替えメニュー */}
        {showClassList && (
          <div className="absolute top-20 right-10 w-64 bg-white rounded-3xl shadow-2xl border border-indigo-50 p-2 z-50 animate-in fade-in zoom-in duration-200">
            {myClasses.map((cls) => (
              <button 
                key={cls.id} 
                onClick={() => { setCurrentClass(cls); setShowClassList(false); }}
                className={`w-full text-left p-4 rounded-2xl font-black text-sm transition-all ${currentClass?.classId === cls.classId ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 text-slate-700'}`}
              >
                {cls.displayName}
              </button>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        <div className="text-center mb-2">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">選択中のクラス</p>
          <h2 className="text-2xl font-black text-slate-800 italic">{currentClass?.displayName}</h2>
        </div>

        <Link 
          href={`/student/upload?classId=${currentClass?.classId}`} 
          className="w-full group p-10 rounded-[40px] shadow-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex flex-col items-center justify-center text-center"
        >
          <IoCameraOutline className="text-5xl mb-4 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter uppercase">作品を撮る</span>
        </Link>

        <Link 
          href={`/student/share?classId=${currentClass?.classId}`} 
          className="w-full group p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-white bg-white hover:border-indigo-100 transition-all flex flex-col items-center justify-center text-center"
        >
          <IoShareSocialOutline className="text-5xl mb-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">みんなのギャラリー</span>
        </Link>

        <Link 
          href={`/student/history?classId=${currentClass?.classId}`} 
          className="w-full group p-10 rounded-[40px] shadow-sm hover:shadow-xl border-2 border-white bg-white hover:border-indigo-100 transition-all flex flex-col items-center justify-center text-center"
        >
          <IoTimeOutline className="text-5xl mb-4 text-slate-400 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">振り返り</span>
        </Link>
      </main>
    </div>
  );
}