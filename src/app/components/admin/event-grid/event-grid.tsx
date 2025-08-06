import { tw } from 'twind';
import { Photo } from '@/types/photo';
import { Event } from '@/types/event';
import EventCard from '../event-card/event-card';

type EventGridProps = {
  photos: Photo[];
  events: Event[];
  onPhotoDelete?: () => void;
};

export default function EventGrid({ photos, events, onPhotoDelete }: EventGridProps) {
  if (photos.length === 0) {
    return (
      <div className={tw`text-center py-12 text-gray-500`}>
        Nenhuma foto encontrada com esses filtros.
      </div>
    );
  }

  // Agrupa as fotos por evento
  const photosByEvent = photos.reduce((acc, photo) => {
    const eventId = photo.eventId;
    if (!acc[eventId]) {
      acc[eventId] = [];
    }
    acc[eventId].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  // Ordena os eventos por data (mais recentes primeiro)
  const sortedEventIds = Object.keys(photosByEvent).sort((a, b) => {
    const eventA = events.find(e => e.eventId === a);
    const eventB = events.find(e => e.eventId === b);
    
    // Verifica se tem createdAt, caso contrário usa data
    const dateA = eventA?.dataEvent || eventA?.dataEvent;
    const dateB = eventB?.dataEvent || eventB?.dataEvent;

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    return dateB.toDate().getTime() - dateA.toDate().getTime();
  });

  return (
    <div className={tw`space-y-4`}>
      {sortedEventIds.map((eventId) => {
        const event = events.find(e => e.eventId === eventId);
        const eventPhotos = photosByEvent[eventId];
        
        // Se não encontrar o evento, cria um evento placeholder
        const displayEvent = event || {
          eventId: eventId,
          eventName: 'Evento não encontrado',
          typeEvent: `Evento com ID: ${eventId}`,
          dataEvent: null,
        };

        return (
          <EventCard
            key={eventId}
            event={displayEvent}
            photos={eventPhotos}
            onPhotoDelete={onPhotoDelete}
          />
        );
      })}
    </div>
  );
}