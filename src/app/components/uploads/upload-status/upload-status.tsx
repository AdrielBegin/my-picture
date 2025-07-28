'use client';
import { tw } from 'twind';

type UploadStatusProps = {
  status: 'idle' | 'loading' | 'success' | 'error';
};

export default function UploadStatus({ status }: UploadStatusProps) {
  if (status === 'idle') return null;

  const statusConfig = {
    loading: { text: 'Enviando foto...', color: 'bg-blue-500' },
    success: { text: 'Foto enviada com sucesso! 🎉', color: 'bg-green-500' },
    error: { text: 'Erro ao enviar. Tente novamente.', color: 'bg-red-500' },
  };

  return (
    <div
      className={tw`p-4 text-white text-center rounded-lg ${statusConfig[status].color} animate-pulse`}
    >
      {statusConfig[status].text}
    </div>
  );
}