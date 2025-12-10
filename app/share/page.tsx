// src/app/share/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoPeopleOutline, IoDocumentTextOutline } from 'react-icons/io5';

export default function ShareSelectPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <header className="mb-8 border-b pb-4">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <IoArrowBack className="w-5 h-5 mr-1" /> ホームへ戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">共有機能</h1>
        <p className="text-xl text-indigo-600 mt-1">他の作品や資料を確認しましょう</p>
      </header>

      <main className="space-y-6">
        {/* 他の生徒の作品を見る */}
        <Link 
          href="/share/student-files" // クラスのファイル一覧画面へ
          className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border-2 border-indigo-100"
        >
          <div className="flex items-center space-x-4">
            <IoPeopleOutline className="w-10 h-10 text-indigo-500" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">他の生徒の作品を見る</h2>
              <p className="text-gray-500 mt-1">クラスメイトの作品にコメントを入力・送信できます。</p>
            </div>
          </div>
        </Link>

        {/* 共有された資料を見る */}
        <Link 
          href="/share/materials" // 共有された資料閲覧画面へ
          className="block p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border-2 border-green-100"
        >
          <div className="flex items-center space-x-4">
            <IoDocumentTextOutline className="w-10 h-10 text-green-500" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">共有された資料を見る</h2>
              <p className="text-gray-500 mt-1">先生から配布された授業資料や参考資料を閲覧します。</p>
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}