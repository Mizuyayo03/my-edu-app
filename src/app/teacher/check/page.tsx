'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '../../../firebase/firebase';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IoTrashOutline, IoChevronBack, IoTimeOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

export default function TeacherCheck() {
  const [activeTasks, setActiveTasks] = useState<any[]>([]); // 進行中
  const [expiredTasks, setExpiredTasks] = useState<any[]>([]); // 期限終了
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!db) return;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // クラス情報
        const qClasses = query(collection(db, "classes"), where("teacherId", "==", user.uid));
        const unsubClasses = onSnapshot(qClasses, (snap) => {
          setClasses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // 自分の課題のみ取得
        const qTasks = query(
          collection(db, "tasks"),
          where("teacherId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubTasks = onSnapshot(qTasks, (snap) => {
          // 💡 TypeScriptの deadline エラーを回避するために as any を使用
          const allTasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
          const now = new Date();

          // 💡 期限チェックをして仕分け
          const active = allTasks.filter((task: any) => {
            if (!task.deadline) return true;
            const deadlineDate = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
            return deadlineDate > now;
          });

          const expired = allTasks.filter((task: any) => {
            if (!task.deadline) return false;
            const deadlineDate = task.deadline.toDate ? task.deadline.toDate() : new Date(task.deadline);
            return deadlineDate <= now;
          });

          setActiveTasks(active);
          setExpiredTasks(expired);
          setLoading(false);
        }, (err) => {
          console.error("Firebase Index Error:", err);
          setLoading(false);
        });

        return () => { unsubClasses(); unsubTasks(); };
      } else {
        router.push('/teacher/login');
      }
    });
    return () => unsubAuth();
  }, [router]);

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "期限なし";
    try {
      const d = dateValue.toDate ? dateValue.toDate() : new Date(dateValue.seconds ? dateValue.seconds * 1000 : dateValue);
      return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
    } catch (e) { return "日時エラー"; }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id || !confirm("この課題箱を削除しますか？")) return;
    try { await deleteDoc(doc(db, "tasks", id)); } catch (e) { alert("失敗"); }
  };

  // リストを表示する部品
  const TaskSection = ({ tasks, title, icon: Icon, colorClass }: any) => (
    <div className="space-y-4">
      <h2 className={`flex items-center gap-2 text-xl font-black ml-4 italic ${colorClass}`}>
        <Icon size={24} /> ● {title}
      </h2>
      <div className="bg-white rounded-[32px] border-2 border-slate-900 overflow-hidden shadow-sm">
        {tasks.length === 0 ? (
          <div className="p-16 text-center text-slate-300 font-bold uppercase tracking-widest italic text-sm">
            No Tasks
          </div>
        ) : (
          tasks.map((task: any, index: number) => {
            const targetClass = classes.find(c => c.id === task.classId);
            return (
              <div key={task.id} className={`${index !== 0 ? 'border-t-2 border-slate-900' : ''}`}>
                {/* 💡 ここを /teacher/check/task/ID に変更しました */}
                <Link href={`/teacher/check/task/${task.id}`} className="block p-8 hover:bg-slate-50 transition-all group">
                  <div className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
                    {targetClass ? (targetClass.className || targetClass.name) : "No Class"}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                      <span className="text-2xl font-black text-slate-800 tracking-tighter">
                        {task.title}
                      </span>
                      <span className="text-xs font-black text-slate-400 italic">
                        Limit: {formatDate(task.deadline)}
                      </span>
                    </div>
                    <button onClick={(e) => handleDelete(e, task.id)} className="w-12 h-12 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                      <IoTrashOutline size={20} />
                    </button>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-black text-slate-200 italic text-2xl animate-pulse uppercase">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 text-slate-900 font-sans pb-32">
      <header className="max-w-5xl mx-auto mb-12 flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <Link href="/teacher" className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all border border-slate-100 group">
            <IoChevronBack size={24} className="text-slate-300 group-hover:text-indigo-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-indigo-600">Check Box</h1>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-1 ml-1 italic">Control</p>
          </div>
        </div>
        <Link href="/teacher/check/create" className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] text-xs font-black shadow-lg shadow-indigo-100 uppercase tracking-widest hover:bg-indigo-700 transition-all">
          + New Task
        </Link>
      </header>

      <main className="max-w-5xl mx-auto space-y-12">
        <TaskSection tasks={activeTasks} title="現在進行中の課題箱" icon={IoTimeOutline} colorClass="text-indigo-600" />
        <TaskSection tasks={expiredTasks} title="期限終了した課題箱" icon={IoCheckmarkCircleOutline} colorClass="text-slate-400" />
      </main>
    </div>
  );
}