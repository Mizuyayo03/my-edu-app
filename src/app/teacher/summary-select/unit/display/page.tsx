'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db, auth } from '../../../../../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { IoChevronBack, IoImageOutline } from 'react-icons/io5';

// 型定義
interface WorkData {
  id: string;
  images?: string[];
  studentNumber: string;
  studentName: string;
  portfolioTitle?: string;
  title?: string;
  taskId: string;
}

interface ClassGroup {
  className: string; // ここに「1年1組」などが入るようにします
  works: WorkData[];
}

function UnitDisplayContent() {
  const searchParams = useSearchParams();
  const unitName = searchParams.get('name');
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && unitName) {
        try {
          // 1. 指定された単元名を持つ課題(tasks)を取得
          const tasksQuery = query(
            collection(db, "tasks"),
            where("teacherId", "==", user.uid),
            where("unitName", "==", unitName)
          );
          const tasksSnap = await getDocs(tasksQuery);
          
          if (tasksSnap.empty) {
            setLoading(false);
            return;
          }

          const taskIds: string[] = [];
          const taskToClassNameMap: { [key: string]: string } = {};
          
          // 💡 クラスIDからクラス名を取得するためのキャッシュ
          const classNameCache: { [key: string]: string } = {};

          for (const taskDoc of tasksSnap.docs) {
            const taskData = taskDoc.data();
            const classId = taskData.classId;
            taskIds.push(taskDoc.id);

            // まだクラス名を取得していない場合のみ、Firestoreから取得
            if (classId && !classNameCache[classId]) {
              const classDocRef = doc(db, "classes", classId);
              const classDocSnap = await getDoc(classDocRef);
              if (classDocSnap.exists()) {
                classNameCache[classId] = classDocSnap.data().className;
              } else {
                classNameCache[classId] = "不明なクラス";
              }
            }
            // 課題IDとクラス名の紐付け
            taskToClassNameMap[taskDoc.id] = classNameCache[classId] || "未設定";
          }

          // 2. 'works' コレクションから提出物を取得
          const worksQuery = query(
            collection(db, "works"),
            where("taskId", "in", taskIds)
          );
          const worksSnap = await getDocs(worksQuery);
          
          const groups: { [key: string]: WorkData[] } = {};
          
          worksSnap.docs.forEach(doc => {
            const data = doc.data();
            const className = taskToClassNameMap[data.taskId]; // IDではなく「クラス名」を取得
            if (!groups[className]) groups[className] = [];
            groups[className].push({ ...data, id: doc.id } as WorkData);
          });

          // 3. クラス名でソートしてセット
          const sortedGroups = Object.keys(groups).sort().map(name => ({
            className: name,
            works: groups[name].sort((a, b) => Number(a.studentNumber) - Number(b.studentNumber))
          }));

          setClassGroups(sortedGroups);
        } catch (error) {
          console.error("データ取得エラー:", error);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsub();
  }, [unitName]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-indigo-300 animate-pulse tracking-widest uppercase">
      Loading Works...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans pb-20">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 flex items-center gap-6">
          <Link href="/teacher/summary-select/unit" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all">
            <IoChevronBack size={24}/>
          </Link>
          <div>
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Unit Archive</p>
            <h1 className="text-2xl font-black text-slate-800 uppercase italic">{unitName}</h1>
          </div>
      </header>

      <main className="p-8 space-y-16">
        {classGroups.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[56px] shadow-sm max-w-2xl mx-auto border-4 border-dashed border-slate-100">
            <IoImageOutline className="text-8xl text-slate-100 mx-auto mb-6" />
            <p className="text-slate-300 font-black tracking-widest uppercase">作品が見つかりません</p>
          </div>
        ) : (
          classGroups.map((group) => (
            <section key={group.className} className="max-w-7xl mx-auto">
              {/* 💡 ここがクラス名（例: 1年1組）になります */}
              <h2 className="text-3xl font-black text-slate-800 italic mb-10 border-l-8 border-indigo-600 pl-6 flex items-baseline gap-4">
                {group.className}
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {group.works.length} Works
                </span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {group.works.map((work: WorkData) => {
                  const displayImg = work.images?.[0] || "";

                  return (
                    <Link key={work.id} href={`/teacher/summary-select/unit/detail/${work.id}`}>
                      <div className="bg-white rounded-[40px] p-3 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500 border border-white group cursor-pointer">
                        <div className="aspect-[4/5] bg-slate-100 rounded-[32px] overflow-hidden mb-4 relative">
                          {displayImg ? (
                            <img src={displayImg} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200"><IoImageOutline size={40}/></div>
                          )}
                          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1 rounded-full text-[10px] font-black">
                            No.{work.studentNumber}
                          </div>
                        </div>
                        <div className="px-3 pb-3">
                          <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1 truncate">{work.studentName}</p>
                          <p className="text-base font-black text-slate-800 line-clamp-2 leading-tight italic">
                            {work.portfolioTitle || work.title || "UNTITLED"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

export default function UnitDisplayPage() {
  return <Suspense><UnitDisplayContent /></Suspense>;
}