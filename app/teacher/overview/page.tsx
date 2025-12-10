// src/app/teacher/overview/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoGridOutline, IoLayersOutline } from 'react-icons/io5';

export default function TeacherOverviewSelectPage() {
  return (
    <div className="min-h-screen bg-indigo-50 p-6 md:p-10">
      <header className="mb-8 border-b pb-4">
        <Link href="/teacher" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <IoArrowBack className="w-5 h-5 mr-1" /> 教師ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">総覧機能 (ファイル管理)</h1>
        <p className="text-xl text-gray-600 mt-1">生徒の作品を学年・単元ごとに確認、管理</p>
      </header>

      <main className="space-y-6">
        {/* 学年ごとのファイル一覧 */}
        <Link 
          href="/teacher/overview/grade" // 学年選択画面へ
          className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border-2 border-indigo-200"
        >
          <div className="flex items-center space-x-4">
            <IoLayersOutline className="w-10 h-10 text-indigo-500" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">学年ごとのファイル一覧</h2>
              <p className="text-gray-500 mt-1">学年全体やクラスを横断して作品を一覧表示します。</p>
            </div>
          </div>
        </Link>

        {/* 単元ごとの進捗確認 */}
        <Link 
          href="/teacher/overview/unit" // 単元選択画面へ
          className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border-2 border-purple-200"
        >
          <div className="flex items-center space-x-4">
            <IoGridOutline className="w-10 h-10 text-purple-500" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">単元ごとの進捗確認</h2>
              <p className="text-gray-500 mt-1">特定の単元で提出された全作品を一覧表示します。</p>
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}