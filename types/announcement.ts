import { Timestamp } from 'firebase/firestore';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Timestamp;
  isPinned: boolean;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  author: string;
  isPinned?: boolean;
}
