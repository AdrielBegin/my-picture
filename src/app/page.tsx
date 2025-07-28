'use client';

import SendPicture from './components/uploads/send-picture/send-picture';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SendPicture />
    </Suspense>
  );
}
