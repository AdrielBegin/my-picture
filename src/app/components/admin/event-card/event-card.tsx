import { tw } from 'twind';
import { Photo } from '@/types/photo';
import { Event } from '@/types/event';
import { useState } from 'react';
import PhotoCard from '../photo-card/photo-card';
import ModalDeleteEvent from '../modal-delete-event/modal-delete-event';
import { toast } from 'react-toastify';

type EventCardProps = {
  event: Event | {
    eventId: string;
    eventName: string;
    typeEvent: string;
    dataEvent: null;
  };
  photos: Photo[];
  onPhotoDelete?: () => void;
  onEventDelete?: (eventId: string) => void; // Novo prop para callback de delete
};

export default function EventCard({ event, photos, onPhotoDelete, onEventDelete }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatDate = (timestamp?: Date) => {
    return timestamp ? new Date(timestamp).toLocaleDateString('pt-BR') : 'N/A';
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Função para deletar o evento
  const handleDeleteEvent = async () => {
    if (!event.eventId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/delete-events/${event.eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar evento');
      }
      toast.success('Evento deletado com sucesso!');
      window.location.reload();
      // Chama o callback para notificar o componente pai
      onEventDelete?.(event.eventId);

    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      alert('Erro ao deletar evento. Tente novamente.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };


  if (photos.length === 0) {
    return null; // Não exibe o card se não há fotos
  }

  return (
    <>
      <div className={tw`bg-white rounded-lg shadow-md overflow-hidden mb-6`}>
        {/* Header do Card do Evento */}
        <div className={tw`bg-blue-50 border-b border-blue-100 p-4`}>
          <div className={tw`flex justify-between items-center`}>
            <div
              className={tw`flex-1 cursor-pointer hover:bg-blue-100 -m-2 p-2 rounded transition-colors`}
              onClick={toggleExpanded}
            >
              <h2 className={tw`text-xl font-semibold text-gray-800`}>
                {event.eventName || 'Evento sem nome'}
              </h2>
              {event.dataEvent && (
                <p className={tw`text-sm text-gray-600 mt-1`}>
                  📅 {formatDate(event.dataEvent.toDate())}
                </p>
              )}
              {event.typeEvent && (
                <p className={tw`text-sm text-gray-600 mt-1`}>
                  {event.typeEvent}
                </p>
              )}
            </div>

            <div className={tw`flex items-center space-x-3`}>
              <span className={tw`bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium`}>
                {photos.length} {photos.length === 1 ? 'foto' : 'fotos'}
              </span>

              {/* Botão de deletar evento */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                disabled={isDeleting}
                className={tw`p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Deletar evento"
              >
                <svg
                  className={tw`w-5 h-5`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              {/* Seta de expansão */}
              <button
                onClick={toggleExpanded}
                className={tw`p-2 hover:bg-blue-100 rounded-full transition-colors`}
              >
                <svg
                  className={tw`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo Expandível com as Fotos */}
        {isExpanded && (
          <div className={tw`p-4 h-[800px] overflow-y-auto`}>
            <div className={tw`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}>
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onDeleteSuccess={onPhotoDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      <ModalDeleteEvent
        isOpen={showDeleteConfirm}
        eventName={event.eventName || 'Evento sem nome'}
        photoCount={photos.length}
        isDeleting={isDeleting}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteEvent}
      />
    </>
  );
}