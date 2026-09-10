import { Timestamp } from 'firebase/firestore';

export interface Post {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  authorId: string;
}

export interface Video {
  id?: string;
  title: string;
  youtubeUrl: string;
  description?: string;
  createdAt: Timestamp;
  authorId: string;
}

export interface Admin {
  id?: string;
}
