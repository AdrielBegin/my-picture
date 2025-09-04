'use client';
import { tw } from 'twind';
import { useEffect, useState } from 'react';

type UploadStatusProps = {
  status: 'idle' | 'loading' | 'success' | 'error';
};

export default function UploadStatus({ status }: UploadStatusProps) {
  const [progress, setProgress] = useState(0);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (status === 'loading') {
      setProgress(0);
      setShowStatus(true);
      
      // Simular progresso de upload
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else if (status === 'success') {
      setProgress(100);
      setShowStatus(true);
      
      // Ocultar após 3 segundos
      const timeout = setTimeout(() => {
        setShowStatus(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    } else if (status === 'error') {
      setShowStatus(true);
      
      // Ocultar após 5 segundos
      const timeout = setTimeout(() => {
        setShowStatus(false);
      }, 5000);
      
      return () => clearTimeout(timeout);
    } else {
      setShowStatus(false);
    }
  }, [status]);

  if (!showStatus || status === 'idle') return null;

  const statusConfig = {
    loading: {
      text: 'Enviando sua foto...',
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      borderColor: 'border-blue-300',
      textColor: 'text-white',
      icon: (
        <svg className={tw`w-6 h-6 animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    success: {
      text: 'Foto enviada com sucesso!',
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      borderColor: 'border-green-300',
      textColor: 'text-white',
      icon: (
        <svg className={tw`w-6 h-6 animate-bounce`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      )
    },
    error: {
      text: 'Erro ao enviar. Tente novamente.',
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600',
      borderColor: 'border-red-300',
      textColor: 'text-white',
      icon: (
        <svg className={tw`w-6 h-6 animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      )
    },
  };

  const config = statusConfig[status];

  return (
    <div className={tw`transform transition-all duration-500 ease-in-out ${
      showStatus ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
    }`}>
      <div className={tw`
        ${config.bgColor} ${config.textColor}
        p-6 rounded-2xl shadow-lg border-2 ${config.borderColor}
        transform transition-all duration-300
      `}>
        <div className={tw`flex items-center justify-center gap-3 mb-4`}>
          {config.icon}
          <span className={tw`text-lg font-semibold`}>{config.text}</span>
        </div>
        
        {status === 'loading' && (
          <div className={tw`space-y-2`}>
            <div className={tw`w-full bg-white bg-opacity-30 rounded-full h-3 overflow-hidden`}>
              <div 
                className={tw`h-full bg-white rounded-full transition-all duration-300 ease-out`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className={tw`text-sm opacity-90 text-center`}>
              {Math.round(progress)}% concluído
            </p>
          </div>
        )}
        
        {status === 'success' && (
          <div className={tw`flex items-center justify-center gap-2 text-sm opacity-90`}>
            <span className={tw`text-2xl animate-bounce`}>🎉</span>
            <span>Sua foto foi compartilhada!</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className={tw`text-center`}>
            <p className={tw`text-sm opacity-90 mb-2`}>
              Verifique sua conexão e tente novamente
            </p>
            <div className={tw`flex items-center justify-center gap-1 text-xs opacity-75`}>
              <svg className={tw`w-4 h-4`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Esta mensagem desaparecerá automaticamente</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}