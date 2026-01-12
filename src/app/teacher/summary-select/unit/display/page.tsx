'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db, auth } from '../../../../../firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { IoChevronBack, IoImageOutline } from 'react-icons/io5';

interface WorkData {
  id: string;
  images?: string[];
  studentNumber: string;
  studentName: string;
  portfolioTitle?: string;
  title?: string;
  taskId: string;
}

interface StudentPortfolio {
  studentName: string;
  studentNumber: string;
  works: WorkData[];
  latestImage: string;
}

interface ClassGroup {
  className: string;
  portfolios: StudentPortfolio[];
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
          const tasksQuery = query(
            collection(db, "tasks"),
            where("teacherId", "==", user.uid),
            where("unitName", "==", unitName)
          );
          const tasksSnap = await getDocs(tasksQuery);
          if (tasksSnap.empty) { setLoading(false); return; }

          const taskIds: string[] = [];
          const taskToClassNameMap: { [key: string]: string } = {};
          const classNameCache: { [key: string]: string } = {};

          for (const taskDoc of tasksSnap.docs) {
            const tData = taskDoc.data();
            // 💡 修正箇所: doc.id ではなく taskDoc.id を使う
            taskIds.push(taskDoc.id); 

            if (tData.classId && !classNameCache[tData.classId]) {
              const cSnap = await getDoc(doc(db, "classes", tData.classId));
              classNameCache[tData.classId] = cSnap.exists() ? cSnap.data().className : "不明";
            }
            taskToClassNameMap[taskDoc.id] = classNameCache[tData.classId] || "未設定";
          }

          const worksQuery = query(collection(db, "works"), where("taskId", "in", taskIds));
          const worksSnap = await getDocs(worksQuery);

          const rawGroups: { [className: string]: { [studentName: string]: StudentPortfolio } } = {};

          worksSnap.docs.forEach(workDoc => {
            const data = workDoc.data() as WorkData;
            const className = taskToClassNameMap[data.taskId] || "未分類";
            
            if (!rawGroups[className]) rawGroups[className] = {};
            if (!rawGroups[className][data.studentName]) {
              rawGroups[className][data.studentName] = {
                studentName: data.studentName,
                studentNumber: data.studentNumber,
                works: [],
                latestImage: data.images?.[0] || ""
              };
            }
            rawGroups[className][data.studentName].works.push({ ...data, id: workDoc.id });
          });

          const formatted = Object.keys(rawGroups).sort().map(cName => ({
            className: cName,
            portfolios: Object.values(rawGroups[cName]).sort((a, b) => Number(a.studentNumber) - Number(b.studentNumber))
          }));

          setClassGroups(formatted);
        } catch (e) {
          console.error("Fetch error:", e);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsub();
  }, [unitName]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-indigo-300 animate-pulse uppercase">Generating Portfolios...</div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 flex items-center gap-6">
        <Link href="/teacher/summary-select/unit" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all">
          <IoChevronBack size={24}/>
        </Link>
        <h1 className="text-2xl font-black text-slate-800 uppercase italic">UNIT: {unitName}</h1>
      </header>

      <main className="p-8 space-y-20">
        {classGroups.map((group) => (
          <section key={group.className} className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black text-slate-800 italic mb-10 border-l-8 border-indigo-600 pl-6 flex items-baseline gap-4">
              {group.className}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
              {group.portfolios.map((portfolio) => (
                <Link key={portfolio.studentName} href={`/teacher/summary-select/unit/student-portfolio?unit=${unitName}&student=${portfolio.studentName}`}>
                  <div className="group cursor-pointer">
                    <div className="relative">
                      <div className="absolute inset-0 bg-slate-200 rounded-[40px] translate-x-2 translate-y-2 group-hover:translate-x-3 group-hover:translate-y-3 transition-all"></div>
                      <div className="relative aspect-[4/5] bg-white rounded-[40px] p-3 shadow-xl border border-white transition-all group-hover:-translate-y-1">
                        <div className="w-full h-full bg-slate-100 rounded-[32px] overflow-hidden relative">
                          <img src={portfolio.latestImage} className="w-full h-full object-cover" alt="" />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white text-[10px] font-black uppercase tracking-widest">
                            {portfolio.works.length} 作品収録
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 px-2 text-center">
                      <p className="text-xs font-black text-indigo-500 uppercase tracking-tighter">No.{portfolio.studentNumber}</p>
                      <p className="text-lg font-black text-slate-800 italic uppercase">{portfolio.studentName}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default function UnitDisplayPage() {
  return <Suspense><UnitDisplayContent /></Suspense>;
}