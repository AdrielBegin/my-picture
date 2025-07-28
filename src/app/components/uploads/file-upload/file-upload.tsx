'use client';
import { useRef } from 'react';
import { tw } from 'twind';

type FileUploadProps = {
  onUpload: (file: File) => void;
};

export default function FileUpload({ onUpload }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className={tw`space-y-4`}>
      <h2 className={tw`text-lg font-semibold text-gray-700`}>Ou envie um arquivo</h2>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className={tw`hidden`}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className={tw`w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600`}
      >
        Selecionar arquivo
      </button>
    </div>
  );
}