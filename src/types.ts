import { Timestamp } from 'firebase/firestore';

export interface Post {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  videoUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  authorId: string;
}

export interface Video {
  id?: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  isShort?: boolean;
  description?: string;
  createdAt?: Timestamp;
  authorId?: string;
}

export interface Admin {
  id?: string;
}
