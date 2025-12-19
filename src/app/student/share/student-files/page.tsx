'use client';
import React from 'react';
import Link from 'next/link';
import { IoArrowBack, IoImageOutline, IoSearchOutline, IoChatbubblesOutline } from 'react-icons/io5';

// ダミーデータ（本来はFirestoreから取得）
const classFiles = {
  className: '1年1組',
  unitName: '美術鑑賞「モナ・リザ」',
  students: [
    { id: 1, number: 1, name: '青山 花子', artworkTitle: '私のモナ・リザ', commentCount: 3 },
    { id: 2, number: 2, name: '池田 太郎', artworkTitle: '自画像：挑戦', commentCount: 0 },
    { id: 3, number: 3, name: '上野 美咲', artworkTitle: '静物デッサン', commentCount: 5 },
    { id: 4, number: 4, name: '遠藤 健太', artworkTitle: '抽象表現', commentCount: 1 },
    { id: 5, number: 5, name: '大森 裕子', artworkTitle: '風景：夏の思い出', commentCount: 2 },
  ],
};

const StudentFileRow: React.FC<{ student: typeof classFiles.students[0] }> = ({ student }) => (
  <Link 
    href={`/student/gallery/list?studentId=${student.id}`} // 🚀 ギャラリーの詳細閲覧へ
    className="flex items-center p-6 hover:bg-indigo-50/50 transition-all active:scale-[0.99]"
  >
    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
      <IoImageOutline className="w-6 h-6 text-slate-400" />
    </div>
    <div className="w-10 font-black italic text-slate-300 text-sm">{student.number}</div>
    <div className="w-32 font-black text-slate-800">{student.name}</div>
    <div className="flex-1 font-bold text-slate-500 truncate pr-4">{student.artworkTitle}</div>
    <div className="flex items-center text-[10px] font-black bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full uppercase tracking-widest">
        <IoChatbubblesOutline className="w-3 h-3 mr-1" /> {student.commentCount}
    </div>
  </Link>
);

export default function StudentFilesPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      <header className="max-w-4xl mx-auto mb-10">
        <Link href="/student/share" className="flex items-center text-indigo-500 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity mb-4">
          <IoArrowBack className="w-3 h-3 mr-1" /> Back to Share
        </Link>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase mb-1">{classFiles.className}</span>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800">{classFiles.unitName}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* 検索・ヘッダーエリア */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student List</h2>
          <div className="relative w-full md:w-72">
            <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search student..."
              className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm text-sm font-bold focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
            />
          </div>
        </div>

        {/* リスト表示 */}
        <div className="bg-white rounded-[40px] shadow-sm overflow-hidden border border-white">
          <div className="flex p-6 bg-slate-900 font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            <div className="w-12 mr-4"></div>
            <div className="w-10">No.</div>
            <div className="w-32">Name</div>
            <div className="flex-1">Title</div>
            <div className="w-20 text-right">Feedback</div>
          </div>

          <div className="divide-y divide-slate-50">
            {classFiles.students
              .sort((a, b) => a.number - b.number)
              .map((student) => (
                <StudentFileRow key={student.id} student={student} />
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}