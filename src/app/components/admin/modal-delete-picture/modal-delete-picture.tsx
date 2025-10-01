'use client';
import { tw } from 'twind';

type DeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
};

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'este item',
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className={tw`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div className={tw`bg-white rounded-lg shadow-xl max-w-md w-full p-6`}>
        <h3 className={tw`text-lg font-medium text-gray-900 mb-4`}>
          Confirmar exclusão
        </h3>
        <p className={tw`text-gray-600 mb-6`}>
          Tem certeza que deseja excluir {itemName}? Esta ação não pode ser desfeita.
        </p>
        <div className={tw`flex justify-end space-x-3`}>
          <button
            onClick={onClose}
            className={tw`px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={tw`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500`}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}