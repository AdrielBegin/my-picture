'use client';
import { useState, useCallback } from 'react';
import { tw } from 'twind';
import FileUpload from '../file-upload/file-upload';
import ChunkedUpload from '../chunked-upload/chunked-upload';

interface SmartUploadProps {
  onUploadComplete: (url: string, fileName: string) => void;
  onError: (error: string) => void;
  eventId?: string;
  userName?: string;
}

interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'error';
  message?: string;
}

const CHUNK_THRESHOLD = 10 * 1024 * 1024; // 10MB - usar chunks para arquivos maiores

export default function SmartUpload({ onUploadComplete, onError, eventId, userName }: SmartUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  });
  const [useChunkedUpload, setUseChunkedUpload] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadProgress({ progress: 0, status: 'idle' });
    
    // Decidir se usar upload em chunks
    const shouldUseChunks = file.size > CHUNK_THRESHOLD;
    setUseChunkedUpload(shouldUseChunks);
    
    if (shouldUseChunks) {
      setUploadProgress({
        progress: 0,
        status: 'idle',
        message: `Arquivo grande detectado (${(file.size / (1024 * 1024)).toFixed(2)}MB). Será usado upload em chunks.`
      });
    } else {
      // Para arquivos menores, fazer upload imediatamente
      handleNormalUpload(file);
    }
  }, []);

  const handleNormalUpload = async (file: File) => {
    setUploadProgress({ progress: 10, status: 'uploading', message: 'Iniciando upload...' });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (eventId) formData.append('eventId', eventId);
      if (userName) formData.append('userName', userName);

      setUploadProgress({ progress: 50, status: 'uploading', message: 'Enviando arquivo...' });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress({ progress: 90, status: 'uploading', message: 'Processando...' });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro no upload');
      }

      const result = await response.json();
      
      setUploadProgress({ progress: 100, status: 'completed', message: 'Upload concluído!' });
      onUploadComplete(result.url, result.fileName);
      
      // Reset após sucesso
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress({ progress: 0, status: 'idle' });
      }, 2000);

    } catch (error) {
      console.error('Erro no upload normal:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no upload';
      setUploadProgress({ progress: 0, status: 'error', message: errorMessage });
      onError(errorMessage);
    }
  };

  const handleChunkedProgress = useCallback((progress: number) => {
    setUploadProgress({
      progress,
      status: 'uploading',
      message: `Upload em progresso: ${Math.round(progress)}%`
    });
  }, []);

  const handleChunkedComplete = useCallback((url: string) => {
    setUploadProgress({ progress: 100, status: 'completed', message: 'Upload em chunks concluído!' });
    onUploadComplete(url, selectedFile?.name || 'arquivo');
    
    // Reset após sucesso
    setTimeout(() => {
      setSelectedFile(null);
      setUploadProgress({ progress: 0, status: 'idle' });
      setUseChunkedUpload(false);
    }, 2000);
  }, [selectedFile, onUploadComplete]);

  const handleChunkedError = useCallback((error: string) => {
    setUploadProgress({ progress: 0, status: 'error', message: error });
    onError(error);
  }, [onError]);

  const handleUploadError = useCallback((error: string) => {
    setUploadProgress({ progress: 0, status: 'error', message: error });
    onError(error);
  }, [onError]);

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress({ progress: 0, status: 'idle' });
    setUseChunkedUpload(false);
  };

  return (
    <div className={tw`space-y-6`}>
      {!selectedFile && (
        <FileUpload onUpload={handleFileSelect} onError={handleUploadError} />
      )}

      {selectedFile && (
        <div className={tw`space-y-4`}>
          {/* Informações do arquivo */}
          <div className={tw`bg-gray-50 p-4 rounded-lg`}>
            <h3 className={tw`font-semibold text-gray-700 mb-2`}>Arquivo Selecionado:</h3>
            <p className={tw`text-sm text-gray-600`}>
              <strong>Nome:</strong> {selectedFile.name}
            </p>
            <p className={tw`text-sm text-gray-600`}>
              <strong>Tamanho:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <p className={tw`text-sm text-gray-600`}>
              <strong>Tipo:</strong> {selectedFile.type}
            </p>
            <p className={tw`text-sm text-gray-600`}>
              <strong>Método:</strong> {useChunkedUpload ? 'Upload em Chunks' : 'Upload Normal'}
            </p>
          </div>

          {/* Barra de progresso */}
          {uploadProgress.status !== 'idle' && (
            <div className={tw`space-y-2`}>
              <div className={tw`w-full bg-gray-200 rounded-full h-2`}>
                <div 
                  className={tw`h-2 rounded-full transition-all duration-300 ${
                    uploadProgress.status === 'error' ? 'bg-red-500' :
                    uploadProgress.status === 'completed' ? 'bg-green-500' :
                    'bg-indigo-600'
                  }`}
                  style={{ width: `${uploadProgress.progress}%` }}
                ></div>
              </div>
              {uploadProgress.message && (
                <p className={tw`text-sm ${
                  uploadProgress.status === 'error' ? 'text-red-600' :
                  uploadProgress.status === 'completed' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {uploadProgress.message}
                </p>
              )}
            </div>
          )}

          {/* Upload em chunks para arquivos grandes */}
          {useChunkedUpload && uploadProgress.status === 'idle' && (
            <ChunkedUpload
              file={selectedFile}
              onProgress={handleChunkedProgress}
              onComplete={handleChunkedComplete}
              onError={handleChunkedError}
              eventId={eventId}
              userName={userName}
            />
          )}

          {/* Botão para cancelar/resetar */}
          <div className={tw`flex gap-2`}>
            <button
              onClick={resetUpload}
              disabled={uploadProgress.status === 'uploading'}
              className={tw`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${
                  uploadProgress.status === 'uploading'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }
              `}
            >
              {uploadProgress.status === 'uploading' ? 'Uploading...' : 'Cancelar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { CHUNK_THRESHOLD };