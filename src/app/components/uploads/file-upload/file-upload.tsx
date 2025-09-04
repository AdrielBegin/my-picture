'use client';
import { useRef, useState, useCallback } from 'react';
import { tw } from 'twind';

type FileUploadProps = {
  onUpload: (file: File) => void;
};

export default function FileUpload({ onUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0] && files[0].type.startsWith('image/')) {
      onUpload(files[0]);
    }
  }, [onUpload]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={tw`space-y-4`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className={tw`hidden`}
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={tw`
          relative w-full p-8 border-3 border-dashed rounded-2xl cursor-pointer
          transition-all duration-300 transform
          ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50 scale-105 shadow-lg'
              : isHovered
              ? 'border-indigo-400 bg-indigo-25 scale-102 shadow-md'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
        `}
      >
        <div className={tw`text-center space-y-4`}>
          <div className={tw`mx-auto w-16 h-16 flex items-center justify-center rounded-full ${
            isDragOver ? 'bg-indigo-100' : 'bg-gray-100'
          } transition-colors duration-300`}>
            <svg 
              className={tw`w-8 h-8 ${
                isDragOver ? 'text-indigo-600' : 'text-gray-500'
              } transition-colors duration-300`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          
          <div className={tw`space-y-2`}>
            <p className={tw`text-lg font-semibold ${
              isDragOver ? 'text-indigo-700' : 'text-gray-700'
            } transition-colors duration-300`}>
              {isDragOver ? 'Solte a imagem aqui!' : 'Arraste uma imagem ou clique para selecionar'}
            </p>
            
            <p className={tw`text-sm text-gray-500`}>
              Formatos suportados: JPG, PNG, GIF (máx. 10MB)
            </p>
          </div>
          
          <div className={tw`pt-2`}>
            <span className={tw`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              isDragOver 
                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                : 'bg-white text-indigo-600 border-2 border-indigo-200 hover:border-indigo-300'
            } transition-all duration-300`}>
              <svg className={tw`w-4 h-4 mr-2`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              Selecionar arquivo
            </span>
          </div>
        </div>
        
        {/* Efeito de brilho animado */}
        {isDragOver && (
          <div className={tw`absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse`}></div>
        )}
      </div>
    </div>
  );
}