'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoCameraOutline, IoShareSocialOutline, IoTimeOutline, IoChevronDownOutline } from 'react-icons/io5';

// --- 型定義 ---
interface StudentProfile {
  studentName: string;
  email: string;
  classId: string;
}

interface DisplayClass {
  id: string;        // usersコレクション内のドキュメントID
  classId: string;   // classesコレクション内のドキュメントID
  displayName: string;
}

export default function StudentStartPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [studentName, setStudentName] = useState<string>('');
  const [myClasses, setMyClasses] = useState<DisplayClass[]>([]);
  const [currentClass, setCurrentClass] = useState<DisplayClass | null>(null);
  const [showClassList, setShowClassList] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 💡 ログイン状態を監視（メール認証に切り替えたので、確実にメールアドレスが取得可能）
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        router.push('/student/login');
        return;
      }
      
      setUser(u);
      
      // ログインユーザーのメールアドレスを取得
      if (u.email) {
        try {
          // 💡 スペースの混入や大文字小文字による不一致を防ぐ
          const emailLower = u.email.toLowerCase().trim();
          console.log("Firestore検索キーワード:", emailLower);

          // 1. 'users' コレクションから、ログイン中のメールアドレスに一致するデータを取得
          const q = query(collection(db, "users"), where("email", "==", emailLower));
          const snap = await getDocs(q);
          
          if (snap.empty) {
            console.error("Firestoreにこのメールアドレスの登録がありません:", emailLower);
            setMyClasses([]);
            setLoading(false);
            return;
          }

          let foundName = "";
          
          // 2. その生徒が所属しているクラスIDを元に、'classes' コレクションから情報を取得
          const classPromises = snap.docs.map(async (userDoc) => {
            const userData = userDoc.data() as StudentProfile;
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
              } else {
                console.warn(`クラスID '${userData.classId}' が classes コレクションに存在しません`);
              }
            }
            return null;
          });

          const results = (await Promise.all(classPromises)).filter((c): c is DisplayClass => c !== null);
          
          setStudentName(foundName);
          setMyClasses(results);
          
          if (results.length > 0) {
            setCurrentClass(results[0]);
          }
        } catch (err) {
          console.error("データ取得中にエラーが発生しました:", err);
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  // 読み込み中の画面
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-300 italic animate-pulse">
      LOADING...
    </div>
  );

  // ログインはできているが、Firestoreに生徒データがない場合のエラー画面
  if (myClasses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
        <div className="bg-white p-10 rounded-[48px] shadow-2xl max-w-sm w-full border-t-[12px] border-rose-500">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-black text-slate-800 mb-2 italic">NOT REGISTERED</h2>
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed mb-6">
            ログインは完了しましたが、名簿（Firestore）にこのメールアドレスが見つかりません。
          </p>
          <div className="text-[10px] font-mono bg-slate-50 p-4 rounded-2xl text-left border border-slate-100 break-all mb-6">
            <p className="text-slate-300 uppercase mb-1 font-black tracking-widest">Logged in as:</p>
            <p className="font-bold text-indigo-500">{user?.email}</p>
          </div>
          <button onClick={() => signOut(auth)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
            ログアウトしてやり直す
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* ナビゲーションバー */}
      <nav className="p-6 px-10 flex justify-between items-center bg-white shadow-sm sticky top-0 z-30 border-b border-slate-100">
        <div className="flex flex-col text-left">
          <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-0.5">Welcome!</span>
          <h1 className="text-xl font-black italic tracking-tighter text-slate-800">
            {studentName} さん
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* クラス表示・切り替えボタン */}
          <button 
            onClick={() => setShowClassList(!showClassList)} 
            className="bg-slate-50 text-slate-700 px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 border border-slate-100 hover:bg-white hover:shadow-sm transition-all"
          >
            {currentClass?.displayName}
            <IoChevronDownOutline className={`text-indigo-500 transition-transform ${showClassList ? 'rotate-180' : ''}`} />
          </button>
          
          <button 
            onClick={() => signOut(auth)} 
            className="w-10 h-10 flex items-center justify-center text-slate-200 hover:text-rose-400 transition-colors"
          >
            <span className="font-black text-[10px] uppercase tracking-tighter">Exit</span>
          </button>
        </div>

        {/* クラス切り替えポップアップ */}
        {showClassList && (
          <div className="absolute top-24 right-10 w-64 bg-white rounded-[32px] shadow-2xl border border-slate-50 p-3 z-50 animate-in fade-in zoom-in duration-200">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest p-3">Switch Class</p>
            {myClasses.map((cls) => (
              <button 
                key={cls.id} 
                onClick={() => { setCurrentClass(cls); setShowClassList(false); }}
                className={`w-full text-left p-4 rounded-2xl font-black text-sm transition-all mb-1 ${currentClass?.classId === cls.classId ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-slate-50 text-slate-600'}`}
              >
                {cls.displayName}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* メインアクション */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto w-full">
        
        <Link 
          href={`/student/upload?classId=${currentClass?.classId}`} 
          className="w-full group p-12 rounded-[56px] shadow-2xl shadow-indigo-100 bg-indigo-600 text-white hover:bg-indigo-700 transition-all flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <IoCameraOutline className="text-6xl mb-4 group-hover:scale-110 transition-transform relative z-10" />
          <span className="text-2xl font-black italic tracking-tighter uppercase relative z-10">作品を撮る</span>
          <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-2 relative z-10">Camera</span>
        </Link>

        <Link 
          href={`/student/share?classId=${currentClass?.classId}`} 
          className="w-full group p-10 rounded-[56px] shadow-sm hover:shadow-xl border-4 border-white bg-white hover:border-indigo-50 transition-all flex flex-col items-center justify-center text-center"
        >
          <IoShareSocialOutline className="text-5xl mb-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">みんなのギャラリー</span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Gallery</span>
        </Link>

        <Link 
          href={`/student/history?classId=${currentClass?.classId}`} 
          className="w-full group p-10 rounded-[56px] shadow-sm hover:shadow-xl border-4 border-white bg-white hover:border-indigo-50 transition-all flex flex-col items-center justify-center text-center"
        >
          <IoTimeOutline className="text-5xl mb-4 text-slate-400 group-hover:scale-110 transition-transform" />
          <span className="text-2xl font-black italic tracking-tighter text-slate-800 uppercase">振り返り</span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">History</span>
        </Link>
      </main>

      <footer className="p-10 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">Art Education System v1.1</p>
      </footer>
    </div>
  );
}