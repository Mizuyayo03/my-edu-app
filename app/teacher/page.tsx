// src/app/teacher/page.tsx

import Link from 'next/link';
import { IoBarChartOutline, IoLayersOutline, IoChatbubblesOutline, IoLogOutOutline } from 'react-icons/io5';

// ダミーユーザー情報
const currentTeacher = {
  name: '山田 太郎',
  role: '美術科教諭',
};

// ホーム画面のボタンデータ
const buttons = [
  { 
    title: '総覧機能', 
    description: '学年・単元ごとに生徒の作品を一覧で管理する', 
    icon: IoLayersOutline, 
    href: '/teacher/overview', 
    color: 'bg-indigo-500 hover:bg-indigo-600' 
  },
  { 
    title: '提出状況確認', 
    description: 'クラスごとの作品の提出状況をリアルタイムで把握する', 
    icon: IoBarChartOutline, 
    href: '/teacher/submissions', 
    color: 'bg-green-500 hover:bg-green-600' 
  },
  { 
    title: '共有資料作成/管理', 
    description: '生徒に配布する授業資料や鑑賞資料を作成・アップロードする', 
    icon: IoChatbubblesOutline, 
    href: '/teacher/materials', // 未作成の画面を想定
    color: 'bg-yellow-500 hover:bg-yellow-600' 
  },
];

const IconButton: React.FC<{ title: string; description: string; icon: React.ElementType; href: string; color: string }> = ({ title, description, icon: Icon, href, color }) => (
  <Link href={href} className={`flex items-center p-6 rounded-xl text-white shadow-lg transition duration-300 transform hover:-translate-y-1 ${color}`}>
    <Icon className="w-10 h-10 mr-4" />
    <div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm opacity-90 mt-1">{description}</p>
    </div>
  </Link>
);

export default function TeacherHomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">教師ホーム画面</h1>
          <p className="text-xl text-indigo-600 mt-1">{currentTeacher.role} - {currentTeacher.name} 先生</p>
        </div>
        <Link href="/" className="flex items-center text-gray-500 hover:text-red-500">
          <IoLogOutOutline className="w-5 h-5 mr-1" /> 生徒ホームへ
        </Link>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buttons.map((button) => (
          <IconButton key={button.title} {...button} />
        ))}
      </main>

      <footer className="mt-12 p-4 text-center text-gray-500 text-sm border-t">
        <p>美術授業支援アプリ - プロトタイプUI (教師用)</p>
      </footer>
    </div>
  );
}