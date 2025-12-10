// src/app/share/student-files/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoImageOutline, IoSearchOutline, IoChatbubblesOutline } from 'react-icons/io5';

// ダミーデータ: クラスの生徒の作品一覧
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
    href={`/share/view-artwork/${student.id}`} // 作品詳細画面へ遷移を想定
    className="flex items-center p-4 border-b hover:bg-indigo-50 transition duration-150"
  >
    <IoImageOutline className="w-6 h-6 mr-4 text-indigo-500" />
    <div className="w-10 text-center font-bold text-gray-600">{student.number}</div>
    <div className="w-32 font-medium text-gray-800">{student.name}</div>
    <div className="flex-1 text-gray-700">{student.artworkTitle}</div>
    <div className="w-24 flex items-center justify-end text-sm text-blue-600">
        <IoChatbubblesOutline className="w-4 h-4 mr-1" /> {student.commentCount} 件
    </div>
  </Link>
);

export default function StudentFilesPage() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <header className="mb-8">
        <Link href="/share" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <IoArrowBack className="w-5 h-5 mr-1" /> 共有選択に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">クラスの作品一覧</h1>
        <p className="text-xl text-indigo-600 mt-1">{classFiles.className} | {classFiles.unitName}</p>
      </header>

      <main>
        {/* 検索エリア */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">生徒別 ファイル一覧 (出席番号順)</h2>
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="生徒名や番号で検索"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 生徒リストのヘッダー */}
        <div className="flex p-4 bg-indigo-100 font-bold text-indigo-800 rounded-t-lg">
          <div className="w-6 mr-4"></div>
          <div className="w-10 text-center">番号</div>
          <div className="w-32">生徒名</div>
          <div className="flex-1">作品タイトル</div>
          <div className="w-24 text-right">コメント数</div>
        </div>

        {/* 生徒リスト */}
        <div className="border border-gray-200 rounded-b-lg shadow-sm divide-y divide-gray-200">
          {classFiles.students
            .sort((a, b) => a.number - b.number) // 出席番号順にソート
            .map((student) => (
              <StudentFileRow key={student.id} student={student} />
            ))}
        </div>
      </main>
    </div>
  );
}