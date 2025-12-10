// src/app/record/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoCameraOutline, IoDocumentTextOutline, IoCloudUploadOutline } from 'react-icons/io5';

export default function RecordPage() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <header className="mb-8 border-b pb-4">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <IoArrowBack className="w-5 h-5 mr-1" /> ホームへ戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">作品記録 (撮影モード)</h1>
        <p className="text-xl text-red-600 mt-1">作品の進捗を記録しましょう</p>
      </header>

      <main className="max-w-4xl mx-auto">
        {/* 撮影エリア */}
        <div className="bg-gray-200 border-4 border-dashed border-gray-400 h-96 flex flex-col justify-center items-center rounded-lg mb-8">
          <IoCameraOutline className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-600 font-semibold">作品撮影エリア（カメラプレビューを想定）</p>
          <p className="text-sm text-gray-500 mt-1">端末のカメラ機能を活用して作品を撮影</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* コメントエリア */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <IoDocumentTextOutline className="w-5 h-5 mr-2 text-indigo-500" /> 記録コメント
            </h2>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 h-40"
              placeholder="今日の進捗や工夫した点、先生に伝えたいことを記録しましょう。"
            ></textarea>
          </div>

          {/* 操作ボタン */}
          <div className="flex flex-col space-y-4">
            <button className="flex items-center justify-center p-4 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition">
              <IoCameraOutline className="w-6 h-6 mr-2" /> 作品を撮影/アップロード
            </button>
            <button className="flex items-center justify-center p-4 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition">
              <IoCloudUploadOutline className="w-6 h-6 mr-2" /> 進捗を保存して提出
            </button>
            <button className="flex items-center justify-center p-3 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition">
              一時保存（提出せず閉じる）
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}