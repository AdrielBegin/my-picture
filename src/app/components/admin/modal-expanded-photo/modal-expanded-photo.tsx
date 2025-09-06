import { tw } from 'twind';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Photo } from '@/types/photo';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { toast } from 'react-toastify';

type PhotoModalProps = {
    photos: Photo[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    onPhotoDelete?: () => void;
};

export default function PhotoExpandedModal({ photos, currentIndex, onClose, onPrev, onNext, onPhotoDelete }: PhotoModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const photo = photos[currentIndex];

    const handleDeletePhoto = async () => {
        if (!photo) return;
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/delete-picture/${photo.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error || 'Falha ao excluir foto');
            }

            toast.success('Foto excluída com sucesso!');
            onPhotoDelete?.();
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Erro ao excluir foto:', error);
            toast.error('Erro ao excluir foto. Tente novamente.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleDownload = async () => {
        try {           

            // Extrair apenas o caminho do arquivo no Firebase Storage
            let storagePath = '';

            if (photo.url.includes('uploads/')) {
                // Se a URL contém 'uploads/', extrair a partir daí
                storagePath = photo.url.split('uploads/')[1].split('?')[0]; // Remove query params também
                storagePath = `uploads/${storagePath}`;
            } else if (photo.url) {
                // Se existe um campo url separado
                storagePath = photo.url;
            } else {
                // Fallback: usar o nome do arquivo
                storagePath = `uploads/${photo.name}`;
            }

            console.log("Storage path:", storagePath);

            // Criar a URL da API SEM o nome do arquivo na rota
            const params = new URLSearchParams({
                path: storagePath,
                filename: photo.name || "imagem.jpg"
            });

            const apiUrl = `/api/download-image?${params.toString()}`;

            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Download error response:", errorData);
                throw new Error(errorData.details || `HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = photo.name || "imagem.jpg";
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(blobUrl);

            console.log("Download completed successfully");
        } catch (error) {
            console.error("Erro ao baixar a imagem:", error);
            alert(`Erro ao baixar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

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

    const modalContent = (
        <div
            className="fullscreen-overlay"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}
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

            {/* Botões de ação */}
            <div className={tw`mt-4 flex items-center gap-3`}>
                <button
                    onClick={handleDownload}
                    className={tw`flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600`}
                >
                    <Download size={18} /> Baixar imagem
                </button>
                
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className={tw`flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600`}
                >
                    <Trash2 size={18} /> Excluir foto
                </button>
            </div>

            {/* Modal de confirmação de exclusão */}
            {showDeleteConfirm && (
                <div className={tw`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]`}>
                    <div className={tw`bg-white rounded-lg p-6 max-w-md mx-4`}>
                        <h3 className={tw`text-lg font-semibold mb-4 text-gray-800`}>
                            Confirmar exclusão
                        </h3>
                        <p className={tw`text-gray-600 mb-6`}>
                            Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.
                        </p>
                        <div className={tw`flex space-x-3 justify-end`}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className={tw`px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50`}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeletePhoto}
                                disabled={isDeleting}
                                className={tw`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isDeleting ? 'Excluindo...' : 'Excluir Foto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(modalContent, document.body);
}
