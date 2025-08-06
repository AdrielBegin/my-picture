import { tw } from 'twind';
import { Photo } from '@/types/photo';
import { Event } from '@/types/event';
import { useState } from 'react';
import PhotoCard from '../photo-card/photo-card';

type EventCardProps = {
  event: Event | {
    eventId: string;
    eventName: string;
    typeEvent: string;    
    dataEvent: null;
  };
  photos: Photo[];
  onPhotoDelete?: () => void;
};

export default function EventCard({ event, photos, onPhotoDelete }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp?: Date) => {
    return timestamp ? new Date(timestamp).toLocaleDateString('pt-BR') : 'N/A';
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (photos.length === 0) {
    return null; // Não exibe o card se não há fotos
  }

  return (
    <div className={tw`bg-white rounded-lg shadow-md overflow-hidden mb-6`}>
      {/* Header do Card do Evento */}
      <div 
        className={tw`bg-blue-50 border-b border-blue-100 p-4 cursor-pointer hover:bg-blue-100 transition-colors`}
        onClick={toggleExpanded}
      >
        <div className={tw`flex justify-between items-center`}>
          <div>
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
            <svg 
              className={tw`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Conteúdo Expandível com as Fotos */}
      {isExpanded && (
        <div className={tw`p-4`}>
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
  );
}