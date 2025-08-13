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
  // Se não há eventos cadastrados, mostra mensagem
  if (events.length === 0) {
    return (
      <div className={tw`text-center py-12 text-gray-500`}>
        Nenhum evento cadastrado ainda.
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
  const sortedEvents = events.sort((a, b) => {
    const dateA = a.dataEvent;
    const dateB = b.dataEvent;

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    return dateB.toDate().getTime() - dateA.toDate().getTime();
  });

  return (
    <div className={tw`space-y-4`}>
      {sortedEvents.map((event) => {
        // Pega as fotos do evento (se existirem)
        const eventPhotos = photosByEvent[event.eventId] || [];
        
        return (
          <EventCard
            key={event.eventId}
            event={event}
            photos={eventPhotos}
            onPhotoDelete={onPhotoDelete}
          />
        );
      })}
    </div>
  );
}