'use client';
import { Suspense } from 'react';
import GaleriaFotos from '@/app/components/admin/galeria-fotos/galeria-fotos';

export default function GaleriaFotosPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <GaleriaFotos />
    </Suspense>
  );
}