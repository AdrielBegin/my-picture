'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Photo } from '@/types/photo';
import Stats from '../stats/stats';
import Filters from '../filters/filters';
import EventGrid from '../event-grid/event-grid'; // Importa o novo componente
import ModalCadastroEvento from '../modal-cadastrar-evento/modal-cadastrar-evento';
import { Event } from '@/types/event';
import { tw } from 'twind';

export default function Dashboard() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const snapshot = await getDocs(collection(db, 'photos'));
      const items: Photo[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Photo));
      
      const eventSnapshot = await getDocs(collection(db, 'events'));
      const eventItems: Event[] = eventSnapshot.docs.map(doc => ({
        eventId: doc.id,
        ...doc.data(),
      } as Event));
      
      setEvents(eventItems);
      setPhotos(items);
      setFilteredPhotos(items);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilter = (eventId: string | null) => {
    if (!eventId) {
      setFilteredPhotos(photos);
    } else {
      const filtered = photos.filter(photo => photo.eventId === eventId);
      setFilteredPhotos(filtered);
    }
  };

  const handlePhotoDelete = () => {
    // Recarrega os dados após exclusão de uma foto
    loadData();
  };

  return (
    <div className={tw`min-h-screen bg-gray-50 p-6`}>
      <header className={tw`mb-8`}>
        <h1 className={tw`text-3xl font-bold text-gray-800`}>📸 Dashboard de Fotos</h1>
        <div className={tw`space-y-2 mt-2`}>
          <p className={tw`text-gray-600`}>Gerencie as fotos enviadas pelos usuários organizadas por eventos</p>
        </div>
      </header>
      
      <Stats photos={photos} />
      <Filters events={events} onFilter={handleFilter} />
      
      {isLoading ? (
        <div className={tw`text-center py-12`}>Carregando fotos...</div>
      ) : (
        <EventGrid 
          photos={filteredPhotos} 
          events={events} 
          onPhotoDelete={handlePhotoDelete}
        />
      )}
      
      <ModalCadastroEvento />
    </div>
  );
}