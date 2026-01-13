import { Timestamp } from 'firebase/firestore';

export type ScheduleType = 'meal' | 'activity' | 'transport' | 'accommodation';

export interface Schedule {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  time: string; // HH:mm 형식
  location: string;
  type: ScheduleType;
  notificationTime: number; // 알림 시간 (분 전)
  createdAt: Timestamp;
}

export interface ScheduleFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  type: ScheduleType;
  notificationTime: number;
}
