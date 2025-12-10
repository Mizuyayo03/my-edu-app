// src/app/teacher/submissions/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTimeOutline } from 'react-icons/io5';

// ダミーデータ: クラスごとの提出状況
const classes = [
  { name: '1年1組', submitted: 25, total: 35, unit: '水彩画' },
  { name: '1年2組', submitted: 30, total: 35, unit: '水彩画' },
  { name: '2年1組', submitted: 20, total: 30, unit: '油絵基礎' },
  { name: '3年1組', submitted: 32, total: 40, unit: '卒業制作' },
];

const SubmissionGauge: React.FC<{ submitted: number; total: number }> = ({ submitted, total }) => {
  const percentage = (submitted / total) * 100;
  const color = percentage < 70 ? 'bg-red-500' : percentage < 90 ? 'bg-yellow-500' : 'bg-green-500';
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${color}`} 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default function SubmissionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <header className="mb-8 border-b pb-4">
        <Link href="/teacher" className="flex items-center text-gray-600 hover:text-gray-800 mb-4">
          <IoArrowBack className="w-5 h-5 mr-1" /> 教師ホームに戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">提出状況確認</h1>
        <p className="text-xl text-green-600 mt-1">各クラスの作品提出状況を把握できます</p>
      </header>

      <main className="space-y-6">
        {classes.map((cls) => (
          <div key={cls.name} className="block p-6 bg-white rounded-xl shadow-lg border-l-4 border-green-400">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{cls.name}</h2>
                <p className="text-sm text-gray-500 mt-1">単元: {cls.unit}</p>
              </div>
              <p className="text-3xl font-extrabold text-green-600">
                {cls.submitted} / {cls.total}
              </p>
            </div>
            
            <SubmissionGauge submitted={cls.submitted} total={cls.total} />
            
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>提出率: {((cls.submitted / cls.total) * 100).toFixed(1)}%</span>
              <span>残り {cls.total - cls.submitted}名</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}