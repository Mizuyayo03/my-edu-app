// src/app/page.tsx
import Link from 'next/link';

export default function EntryPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 gap-8">
      <h1 className="text-4xl font-black text-white italic tracking-tighter mb-4">PORTAL</h1>
      <Link href="/teacher" className="w-full max-w-xs p-8 bg-white rounded-3xl text-center font-black text-xl shadow-xl hover:bg-indigo-50 transition-all">
        TEACHER
      </Link>
      <Link href="/student" className="w-full max-w-xs p-8 bg-indigo-600 text-white rounded-3xl text-center font-black text-xl shadow-xl hover:bg-indigo-700 transition-all">
        STUDENT
      </Link>
    </div>
  );
}