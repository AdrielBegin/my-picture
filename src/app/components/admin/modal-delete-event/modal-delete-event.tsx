'use client';
import { tw } from 'twind';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState } from 'react';

type ModalDeleteEventsProps = {
    isOpen: boolean;
    eventId: string;
    eventName: string;
    photoCount: number;
    isDeleting?: boolean;
    onClose: () => void;
    onConfirm: () => void;
};


export default function ModalDeleteEvent({
    isOpen,
    eventId,
    eventName,
    photoCount,
    isDeleting = false,
    onClose,
    onConfirm,
}: ModalDeleteEventsProps) {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setDeleting(true);

            // Deletar todas as fotos do evento
            const photosQuery = query(
                collection(db, 'photos'),
                where('eventId', '==', eventId)
            );
            const photosSnapshot = await getDocs(photosQuery);
            
            const deletePromises = photosSnapshot.docs.map(photoDoc => 
                deleteDoc(doc(db, 'photos', photoDoc.id))
            );
            await Promise.all(deletePromises);

            // Deletar o evento
            await deleteDoc(doc(db, 'events', eventId));

            onConfirm();
        } catch (error) {
            console.error('Erro ao deletar evento:', error);
            alert('Erro ao deletar evento. Tente novamente.');
        } finally {
            setDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`fullscreen-overlay ${tw`bg-black bg-opacity-50 flex items-center justify-center z-[99999]`}`}>
            <div className={tw`bg-white rounded-lg p-6 max-w-md mx-4`}>
                <h3 className={tw`text-lg font-semibold mb-4 text-gray-800`}>
                    Confirmar exclusão
                </h3>
                <p className={tw`text-gray-600 mb-6 break-words`}>
                    Tem certeza que deseja deletar o evento <strong className={tw`break-all`}>{eventName}</strong>?
                    {photoCount > 0 && (
                        <span className={tw`block mt-2 text-sm text-red-600`}>
                            Este evento possui {photoCount} foto{photoCount !== 1 ? 's' : ''} que também serão deletadas permanentemente.
                        </span>
                    )}
                </p>
                <div className={tw`flex space-x-3 justify-end`}>
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className={tw`px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className={tw`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {deleting ? 'Deletando...' : 'Deletar Evento'}
                    </button>
                </div>
            </div>
        </div>
    );
}
