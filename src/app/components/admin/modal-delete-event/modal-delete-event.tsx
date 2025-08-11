'use client';
import { tw } from 'twind';

type ModalDeleteEventsProps = {
    isOpen: boolean;
    eventName: string;
    photoCount: number;
    isDeleting?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ModalDeleteEvent({
    isOpen,
    eventName,
    photoCount,
    isDeleting = false,
    onCancel,
    onConfirm,
}: ModalDeleteEventsProps) {
    if (!isOpen) return null;

    return (
        <div className={`fullscreen-overlay ${tw`bg-black bg-opacity-50 flex items-center justify-center z-[99999]`}`}>
            <div className={tw`bg-white rounded-lg p-6 max-w-md mx-4`}>
                <h3 className={tw`text-lg font-semibold mb-4 text-gray-800`}>
                    Confirmar exclusão
                </h3>
                <p className={tw`text-gray-600 mb-6`}>
                    Tem certeza que deseja deletar o evento {eventName}?
                    <br />
                    <span className={tw`font-medium text-red-600`}>
                        Esta ação não pode ser desfeita e todas as {photoCount} fotos serão perdidas.
                    </span>
                </p>
                <div className={tw`flex space-x-3 justify-end`}>
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className={tw`px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50`}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className={tw`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isDeleting ? 'Deletando...' : 'Deletar Evento'}
                    </button>
                </div>
            </div>
        </div>
    );
}
