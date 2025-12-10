// src/app/page.tsx

'use client'; 
import Link from 'next/link';
import { IoCameraOutline, IoPeopleOutline, IoTimeOutline, IoLogOutOutline } from 'react-icons/io5';

// ダミーユーザー情報
const currentUser = {
  name: 'MizuY',
  className: '1年1組',
  isTeacher: false,
};

// ホーム画面のボタンデータ
const buttons = [
  { 
    title: '記録 (撮影モード)', 
    description: '作品の進捗を撮影し、コメントを記録する', 
    icon: IoCameraOutline, 
    href: '/record', 
    color: 'bg-red-500 hover:bg-red-600' 
  },
  { 
    title: '共有機能', 
    description: '他の生徒の作品を閲覧し、コメントを送信する', 
    icon: IoPeopleOutline, 
    href: '/share', 
    color: 'bg-indigo-500 hover:bg-indigo-600' 
  },
  { 
    title: '振り返り (鑑賞モード)', 
    description: '過去の作品やコメントを単元ごとに見返す', 
    icon: IoTimeOutline, 
    href: '/review', 
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

export default function StudentHomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">生徒ホーム画面</h1>
          <p className="text-xl text-indigo-600 mt-1">{currentUser.className} - {currentUser.name} さん</p>
        </div>
        <Link href="/teacher/login" className="flex items-center text-gray-500 hover:text-red-500">
          <IoLogOutOutline className="w-5 h-5 mr-1" /> 教師ログインへ
        </Link>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buttons.map((button) => (
          <IconButton key={button.title} {...button} />
        ))}
      </main>

      <footer className="mt-12 p-4 text-center text-gray-500 text-sm border-t">
        <p>美術授業支援アプリ - プロトタイプUI (生徒用)</p>
      </footer>
    </div>
  );
}
