'use client';
import { useRef, useState, useCallback } from 'react';
import { tw } from 'twind';
import { FaCamera } from 'react-icons/fa6';

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
          relative w-full p-4 border-3 border-dashed rounded-2xl cursor-pointer
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
           <FaCamera className={tw`w-8 h-8 text-indigo-600`} />
          </div>
          
          <div className={tw`space-y-2`}>
            <p className={tw`text-lg font-semibold ${
              isDragOver ? 'text-indigo-700' : 'text-gray-700'
            } transition-colors duration-300`}>
              {isDragOver ? 'Solte a imagem aqui!' : 'Arraste uma imagem, clique para selecionar ou tirar uma foto'}
            </p>
            
            <p className={tw`text-sm text-gray-500`}>
              Formatos suportados: JPG, PNG, GIF (máx. 10MB)
            </p>
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