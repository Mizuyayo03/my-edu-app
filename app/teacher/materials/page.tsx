// src/app/teacher/materials/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoDocumentTextOutline, IoAddCircleOutline, IoCloudUploadOutline } from 'react-icons/io5';

// ダミーデータ: 既存の資料
const existingMaterials = [
  { id: 1, title: 'モナ・リザ鑑賞資料', date: '2025/12/01', status: '公開中' },
  { id: 2, title: '水彩画テクニック集', date: '2025/11/15', status: '公開中' },
  { id: 3, title: 'デッサン講義スライド', date: '2025/10/01', status: '下書き' },
];

export default function TeacherMaterialsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <header className="mb-8 border-b pb-4">
        <Link href="/teacher" className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <IoArrowBack className="w-5 h-5 mr-1" /> 教師ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">共有資料作成/管理</h1>
        <p className="text-xl text-yellow-600 mt-1">授業で生徒に配布する資料を管理します</p>
      </header>

      <main>
        <div className="flex space-x-4 mb-8">
          <button className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition">
            <IoAddCircleOutline className="w-5 h-5 mr-2" /> 新規資料作成
          </button>
          <button className="flex items-center px-6 py-3 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition">
            <IoCloudUploadOutline className="w-5 h-5 mr-2" /> 既存ファイルをアップロード
          </button>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">既存の資料一覧</h2>
        
        <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-200">
          {existingMaterials.map((material) => (
            <div key={material.id} className="flex items-center justify-between p-4 hover:bg-yellow-50 transition">
              <div className="flex items-center space-x-3">
                <IoDocumentTextOutline className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-800">{material.title}</p>
                  <p className="text-sm text-gray-500">最終更新日: {material.date}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${material.status === '公開中' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {material.status}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}