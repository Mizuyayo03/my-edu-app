// src/types/index.ts

import { Timestamp } from 'firebase/firestore';

// 1. ユーザー（生徒・先生）のデータ構造
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'teacher'; // roleは必ず'student'か'teacher'のどちらか
  createdAt?: Timestamp;
}

// 2. クラスのデータ構造
export interface ClassGroup {
  id: string;
  name: string;
  teacherId: string;
  inviteCode?: string;
}

// 3. 投稿作品（Work）のデータ構造
export interface Work {
  id: string;
  userId: string;
  userName: string;
  classId: string;
  images: string[];      // 画像のURLが配列で入る
  comment: string;
  brightness?: number;   // 画像の明るさ設定
  createdAt: Timestamp;
}

// 4. 感想（Comment）のデータ構造（今後使う用）
export interface Feedback {
  id: string;
  workId: string;
  fromUserId: string;
  fromUserName: string;
  content: string;
  createdAt: Timestamp;
}