'use client';
import { Suspense } from 'react';
import MeusEventos from '@/app/components/admin/meus-eventos/meus-eventos';

export default function MeusEventosPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MeusEventos />
    </Suspense>
  );
}