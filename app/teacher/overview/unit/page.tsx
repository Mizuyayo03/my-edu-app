// src/app/teacher/overview/unit/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTimeOutline, IoSearchOutline } from 'react-icons/io5';

// ダミーデータ: 鉛筆デッサン単元の生徒別進捗
const unitProgress = {
  unitName: '鉛筆デッサン基礎',
  className: '1年1組',
  students: [
    { id: 1, number: 1, name: '青山 花子', status: '提出済', date: '2025/07/15' },
    { id: 2, number: 2, name: '池田 太郎', status: '未提出', date: '' },
    { id: 3, number: 3, name: '上野 美咲', status: '提出済', date: '2025/07/16' },
    { id: 4, number: 4, name: '遠藤 健太', status: '途中保存', date: '2025/07/10' },
    { id: 5, number: 5, name: '大森 裕子', status: '提出済', date: '2025/07/15' },
  ],
};

// ステータスに応じた表示コンポーネント
const StatusDisplay: React.FC<{ status: string; date: string }> = ({ status, date }) => {
  if (status === '提出済') {
    return (
      <span className="flex items-center text-green-600">
        <IoCheckmarkCircleOutline className="w-5 h-5 mr-1" /> {date}
      </span>
    );
  } else if (status === '未提出') {
    return (
      <span className="flex items-center text-red-600">
        <IoCloseCircleOutline className="w-5 h-5 mr-1" /> {status}
      </span>
    );
  } else if (status === '途中保存') {
    return (
      <span className="flex items-center text-yellow-600">
        <IoTimeOutline className="w-5 h-5 mr-1" /> {status}
      </span>
    );
  }
  return <span className="text-gray-500">{status}</span>;
};

export default function UnitProgressPage() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-10">
      <header className="mb-8">
        <Link href="/teacher/overview" className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <IoArrowBack className="w-5 h-5 mr-1" /> 総覧選択に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">単元別 進捗確認</h1>
        <p className="text-xl text-purple-600 mt-1">{unitProgress.className} | 単元: {unitProgress.unitName}</p>
      </header>

      <main>
        {/* フィルタエリア */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">生徒別 進捗リスト</h2>
          <select className="p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500">
            <option>すべての生徒</option>
            <option>提出済のみ</option>
            <option>未提出のみ</option>
          </select>
        </div>

        {/* リストヘッダー */}
        <div className="flex p-4 bg-purple-100 font-bold text-purple-800 rounded-t-lg">
          <div className="w-10 text-center">番号</div>
          <div className="w-40">生徒名</div>
          <div className="flex-1">現在のステータス</div>
          <div className="w-40 text-right">最終提出/更新日</div>
        </div>

        {/* 生徒リスト */}
        <div className="border border-gray-200 rounded-b-lg shadow-sm divide-y divide-gray-200">
          {unitProgress.students
            .sort((a, b) => a.number - b.number)
            .map((student) => (
              <div 
                key={student.id} 
                className="flex items-center p-4 border-b hover:bg-purple-50 transition duration-150"
              >
                <div className="w-10 text-center font-bold text-gray-600">{student.number}</div>
                <div className="w-40 font-medium text-gray-800">{student.name}</div>
                <div className="flex-1">
                  <StatusDisplay status={student.status} date={student.date} />
                </div>
                <div className="w-40 text-right text-sm text-gray-500">
                  {student.status === '提出済' ? student.date : '-'}
                </div>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}