import { Timestamp } from 'firebase/firestore';

export interface MenuItem {
  name: string;
  price: number;
  selectedBy: string[];
}

export interface Menu {
  id: string;
  scheduleId: string;
  restaurant: string;
  items: MenuItem[];
  createdAt: Timestamp;
}

export interface MenuFormData {
  scheduleId: string;
  restaurant: string;
  items: Omit<MenuItem, 'selectedBy'>[];
}
