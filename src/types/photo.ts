import { Timestamp } from 'firebase/firestore';

export type Photo = {
  eventId: string;
  id?: string;
  url: string;
  userName?: string;
  userEmail?: string;
  createdAt?: Timestamp;  
};