import { Timestamp } from 'firebase/firestore';

export type Event = {
  eventId: string;
  createdAt?: Timestamp;
  dataEvent?: Timestamp;
  eventName?: string;
  local?: string;
  typeEvent?: string;
  urlQrCode?: string | null;
  qrCodeImage?: string;
  qrCodeGeneratedAt?: Date;
};