import { Timestamp } from 'firebase/firestore';

export type TabType = 'resources' | 'posts';

export interface PostFile {
  name: string;
  uri: string;
  type: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  createdAt: Timestamp;
  files?: PostFile[];
  commentCount: number;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
  replies?: Comment[];
}

export interface Resource {
  id?: string;
  title: string;
  description: string;
  createdAt: Timestamp | null;
  file?: PostFile;
} 