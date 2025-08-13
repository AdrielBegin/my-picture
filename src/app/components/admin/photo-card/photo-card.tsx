import { tw } from 'twind';
import { Photo } from '@/types/photo';
import { useState } from 'react';
import DeleteModal from '../modal-delete-picture/modal-delete-picture';
import { toast } from 'react-toastify';
import Image from 'next/image';

type PhotoCardProps = {
  photo: Photo;
  onDeleteSuccess?: () => void;
  onClick?: () => void;
};

export default function PhotoCard({ photo, onDeleteSuccess, onClick }: PhotoCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (timestamp?: Date) => {
    return timestamp ? new Date(timestamp).toLocaleString() : 'N/A';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que o clique no botão abra o modal de imagem
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/delete-picture/${photo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro detalhado da API:', errorData);
        throw new Error(errorData?.error || 'Falha ao excluir foto');
      }

      toast.success('Foto excluída com sucesso!');
      onDeleteSuccess?.();
      window.location.reload();

    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      toast.error('Erro ao excluir foto. Tente novamente.');

    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleCardClick = () => {
    console.log('Card clicado!', onClick); // Debug
    if (onClick) {
      onClick();
    } else {
      console.log('onClick não foi fornecido como prop!');
    }
  };

  return (
    <>
      <div
        className={tw`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer`}
        onClick={() => { handleCardClick() }}
      >
        <Image
          src={photo.url}
          alt={`Foto enviada por ${photo.userName || 'usuário'}`}
          width={400}
          height={192}
          className={tw`object-cover`}
        />

        <div className={tw`p-4`}>
          <h3 className={tw`font-medium text-gray-800 truncate`}>
            {photo.userName || 'Anônimo'}
          </h3>
          <p className={tw`text-sm text-gray-500`}>
            {formatDate(photo.createdAt?.toDate())}
          </p>
          <div className={tw`mt-2 flex justify-end`}>
            <button
              onClick={handleDelete}
              className={tw`text-red-500 hover:text-red-700 text-sm`}
            >
              Excluir
            </button>
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName="esta foto"
      />
    </>
  );
}