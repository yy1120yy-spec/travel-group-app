import { Timestamp } from 'firebase/firestore';

export interface Group {
  id: string;
  name: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  members: string[];
  createdBy: string;
}

export interface GroupFormData {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  createdBy: string;
}
