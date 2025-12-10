// src/app/review/page.tsx

import Link from 'next/link';
import { IoArrowBack, IoFolderOpenOutline, IoImageOutline, IoChatbubblesOutline } from 'react-icons/io5';

// ダミーデータ: 過去の単元と作品
const reviewData = {
  currentStudent: 'MizuY',
  units: [
    { 
      id: 1, 
      name: '1学期：鉛筆デッサン基礎', 
      date: '2025/07', 
      artworks: [
        { id: 101, title: 'デッサン：りんご', comments: 3, image: 'apple.png' },
        { id: 102, title: 'デッサン：石膏像 (途中)', comments: 1, image: 'statue.png' },
      ] 
    },
    { 
      id: 2, 
      name: '2学期：水彩画', 
      date: '2025/11', 
      artworks: [
        { id: 201, title: '水彩：風景画', comments: 5, image: 'landscape.png' },
      ] 
    },
  ]
};

const ArtworkCard: React.FC<{ artwork: typeof reviewData.units[0]['artworks'][0] }> = ({ artwork }) => (
  <Link 
    href={`/review/${artwork.id}`} 
    className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition duration-200 block border-l-4 border-yellow-500"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <IoImageOutline className="w-6 h-6 text-yellow-600" />
        <p className="font-semibold text-gray-800">{artwork.title}</p>
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <IoChatbubblesOutline className="w-4 h-4 mr-1 text-blue-500" />
        {artwork.comments}件のコメント
      </div>
    </div>
  </Link>
);

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-yellow-50 p-6 md:p-10">
      <header className="mb-8 border-b pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">振り返り (鑑賞モード)</h1>
          <p className="text-xl text-gray-600 mt-1">生徒: {reviewData.currentStudent} | 過去の作品を閲覧</p>
        </div>
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800">
          <IoArrowBack className="w-5 h-5 mr-1" /> ホームへ
        </Link>
      </header>

      <main>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">学年ごと/単元ごとのファイル一覧</h2>
        
        <div className="space-y-6">
          {reviewData.units.map((unit) => (
            <div key={unit.id} className="bg-white p-5 rounded-xl shadow-md border border-gray-200">
              <div className="flex items-center space-x-3 border-b pb-3 mb-4">
                <IoFolderOpenOutline className="w-7 h-7 text-orange-500" />
                <h3 className="text-xl font-bold text-orange-700">
                  {unit.name} <span className="text-sm font-normal text-gray-500 ml-2">({unit.date} 制作)</span>
                </h3>
              </div>
              
              <div className="space-y-3">
                {unit.artworks.map((artwork) => (
                  <ArtworkCard key={artwork.id} artwork={artwork} />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-gray-700">
          <p>💡 **振り返り機能**: ファイルは学年が上がっても前年の作品も継続して見れます。（フロー図より）</p>
        </div>
      </main>
    </div>
  );
}