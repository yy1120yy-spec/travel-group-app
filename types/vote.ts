import { Timestamp } from 'firebase/firestore';

export interface Vote {
  id: string;
  question: string;
  options: string[];
  votes: { [option: string]: string[] }; // 옵션별 투표자 배열
  createdBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
  allowMultiple: boolean;
}

export interface VoteFormData {
  question: string;
  options: string[];
  createdBy: string;
  expiresAt: Date | null;
  allowMultiple: boolean;
}

export interface VoteResult {
  option: string;
  count: number;
  voters: string[];
  percentage: number;
}
