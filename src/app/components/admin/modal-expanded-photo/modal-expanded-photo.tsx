import { tw } from 'twind';
import { useEffect } from 'react';
import { Photo } from '@/types/photo';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";

type PhotoModalProps = {
    photos: Photo[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
};

export default function PhotoExpandedModal({ photos, currentIndex, onClose, onPrev, onNext }: PhotoModalProps) {
    const photo = photos[currentIndex];

    // Fechar com tecla ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onPrev, onNext]);

    if (!photo) return null;

    return (
        <div
            className={tw`fullscreen-overlay inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-[9999]`}
        >
            {/* Botão Fechar */}
            <button
                onClick={onClose}
                className={tw`absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-200`}
            >
                <X size={20} />
            </button>

            {/* Imagem */}
            <Image
                src={photo.url}
                alt="Foto ampliada"
                layout="responsive"
                width={900}
                height={800}
                className={tw`rounded-lg shadow-lg max-h-[80vh] w-auto object-contain`}
                style={{ maxHeight: 'auto' }}
            />

            {/* Botões de navegação */}
            <button
                onClick={onPrev}
                className={tw`absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-200`}
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={onNext}
                className={tw`absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-200`}
            >
                <ChevronRight size={24} />
            </button>

            {/* Botão Download */}
            <a
                href={photo.url}
                download
                className={tw`mt-4 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600`}
            >
                <Download size={18} />
                Baixar imagem
            </a>
        </div>
    );
}
