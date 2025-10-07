'use client';
import { useState, useCallback } from 'react';
import { tw } from 'twind';

interface ChunkedUploadProps {
  file: File;
  onProgress: (progress: number) => void;
  onComplete: (url: string) => void;
  onError: (error: string) => void;
  eventId?: string;
  userName?: string;
}

interface ChunkUploadResponse {
  success: boolean;
  chunkIndex: number;
  uploadId?: string;
  error?: string;
}

interface FinalizeResponse {
  success: boolean;
  url?: string;
  error?: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB por chunk

export default function ChunkedUpload({ file, onProgress, onComplete, onError, eventId, userName }: ChunkedUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const uploadChunk = async (chunk: Blob, chunkIndex: number, totalChunks: number, uploadId: string): Promise<ChunkUploadResponse> => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('uploadId', uploadId);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    if (eventId) formData.append('eventId', eventId);

    const response = await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erro no upload do chunk ${chunkIndex}: ${response.statusText}`);
    }

    return response.json();
  };

  const finalizeUpload = async (uploadId: string): Promise<FinalizeResponse> => {
    const response = await fetch('/api/finalize-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uploadId,
        fileName: file.name,
        fileType: file.type,
        totalSize: file.size,
        eventId,
        userName,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao finalizar upload: ${response.statusText}`);
    }

    return response.json();
  };

  const startChunkedUpload = useCallback(async () => {
    if (isUploading) return;

    setIsUploading(true);
    
    try {
      // Gerar ID único para este upload
      const newUploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setUploadId(newUploadId);

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      // Upload de cada chunk
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, chunkIndex, totalChunks, newUploadId);
        
        // Atualizar progresso
        const progress = ((chunkIndex + 1) / totalChunks) * 90; // 90% para upload, 10% para finalização
        onProgress(progress);
      }

      // Finalizar upload
      onProgress(95);
      const finalResult = await finalizeUpload(newUploadId);
      
      if (finalResult.success && finalResult.url) {
        onProgress(100);
        onComplete(finalResult.url);
      } else {
        throw new Error(finalResult.error || 'Erro ao finalizar upload');
      }

    } catch (error) {
      console.error('Erro no upload em chunks:', error);
      onError(error instanceof Error ? error.message : 'Erro desconhecido no upload');
    } finally {
      setIsUploading(false);
      setUploadId(null);
    }
  }, [file, isUploading, onProgress, onComplete, onError]);

  return (
    <div className={tw`space-y-4`}>
      <div className={tw`text-center`}>
        <h3 className={tw`text-lg font-semibold text-gray-700`}>
          Upload em Chunks
        </h3>
        <p className={tw`text-sm text-gray-500`}>
          Arquivo: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
        </p>
      </div>

      <button
        onClick={startChunkedUpload}
        disabled={isUploading}
        className={tw`
          w-full px-4 py-2 rounded-lg font-medium transition-colors
          ${
            isUploading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }
        `}
      >
        {isUploading ? 'Fazendo upload...' : 'Iniciar Upload em Chunks'}
      </button>

      {uploadId && (
        <div className={tw`text-xs text-gray-400 text-center`}>
          ID do Upload: {uploadId}
        </div>
      )}
    </div>
  );
}

export { CHUNK_SIZE };