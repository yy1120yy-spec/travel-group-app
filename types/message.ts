import { Timestamp } from 'firebase/firestore';

export interface Message {
  id: string;
  groupId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  author: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited: boolean;
  imageUrl?: string;
  imageMetadata?: {
    name: string;
    size: number;
    type: string;
  };
  readBy: string[];
}

export interface MessageFormData {
  content: string;
  type: 'text' | 'image' | 'system';
  author: string;
  imageUrl?: string;
  imageMetadata?: {
    name: string;
    size: number;
    type: string;
  };
}

export interface TypingStatus {
  id: string;
  userName: string;
  groupId: string;
  lastTyping: Timestamp;
}
