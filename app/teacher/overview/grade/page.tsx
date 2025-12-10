// src/app/teacher/overview/grade/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoFolderOutline, IoImageOutline, IoSearchOutline } from 'react-icons/io5';

// ダミーデータ: 1年1組の作品一覧
const gradeFiles = {
  gradeName: '1年生 (全クラス)',
  totalFiles: 155,
  files: [
    { id: 101, name: '青山 花子 - りんごデッサン', unit: '鉛筆デッサン基礎', class: '1組', date: '2025/07/15' },
    { id: 102, name: '池田 太郎 - 静物：花瓶', unit: '鉛筆デッサン基礎', class: '1組', date: '2025/07/18' },
    { id: 103, name: '佐藤 健太 - 風景画', unit: '水彩画', class: '2組', date: '2025/11/01' },
    { id: 104, name: '田中 美咲 - モナ・リザ鑑賞文', unit: '美術鑑賞', class: '3組', date: '2025/12/09' },
  ],
};

const FileRow: React.FC<{ file: typeof gradeFiles.files[0] }> = ({ file }) => (
  <Link 
    href={`/teacher/view-file/${file.id}`} // 詳細画面への遷移を想定
    className="flex items-center p-4 border-b hover:bg-gray-100 transition duration-150"
  >
    <IoImageOutline className="w-6 h-6 mr-4 text-gray-500" />
    <div className="w-40 font-medium text-gray-800 truncate">{file.name}</div>
    <div className="w-24 text-sm text-indigo-600">{file.class}</div>
    <div className="flex-1 text-sm text-gray-600 truncate">{file.unit}</div>
    <div className="w-20 text-right text-sm text-gray-500">{file.date}</div>
  </Link>
);

export default function GradeFilesPage() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <header className="mb-8">
        <Link href="/teacher/overview" className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <IoArrowBack className="w-5 h-5 mr-1" /> 総覧選択に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">学年別 ファイル総覧</h1>
        <p className="text-xl text-indigo-600 mt-1">{gradeFiles.gradeName} | 総ファイル数: {gradeFiles.totalFiles}件</p>
      </header>

      <main>
        {/* 検索・フィルタエリア */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="生徒名や単元名で検索"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 w-80"
            />
          </div>
          <select className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
            <option>すべての単元</option>
            <option>鉛筆デッサン基礎</option>
            <option>水彩画</option>
          </select>
        </div>

        {/* ファイルリストのヘッダー */}
        <div className="flex p-4 bg-indigo-100 font-bold text-indigo-800 rounded-t-lg">
          <div className="w-6 mr-4"></div>
          <div className="w-40">ファイル名</div>
          <div className="w-24">クラス</div>
          <div className="flex-1">単元名</div>
          <div className="w-20 text-right">提出日</div>
        </div>

        {/* ファイルリスト */}
        <div className="border border-gray-200 rounded-b-lg shadow-sm divide-y divide-gray-200">
          {gradeFiles.files.map((file) => (
            <FileRow key={file.id} file={file} />
          ))}
        </div>
      </main>
    </div>
  );
}