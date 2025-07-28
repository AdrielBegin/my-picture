import { Timestamp } from 'firebase/firestore';

export type Event = {
  eventId?: string;
  createdAt?: Timestamp;
  eventName?: string;
  local?: string;
  typeEvent?: string;
};