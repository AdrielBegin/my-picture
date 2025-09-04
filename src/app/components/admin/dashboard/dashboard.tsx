'use client';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Photo } from '@/types/photo';
import Stats from '../stats/stats';
import Filters from '../filters/filters';
import EventGrid from '../event-grid/event-grid';
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
    loadData();
  };

  return (
    <div className={tw`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative`}>
      {/* Background decorative elements */}
      <div className={tw`absolute inset-0 overflow-hidden pointer-events-none`}>
        <div className={tw`absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl`}></div>
        <div className={tw`absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl`}></div>
      </div>

      <div className={tw`px-4 sm:px-6 lg:px-8 xl:px-12 py-8 w-full min-h-screen max-w-none`}>
        {/* Modern Header */}
        <header className={tw`mb-10 fadeIn`}>
          <div className={tw`bg-white/85 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/30`}>
            <div className={tw`flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6`}>
              <div className={tw`flex items-center space-x-6`}>
                <div className={tw`w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl`}>
                  <span className={tw`text-3xl`}>📸</span>
                </div>
                <div>
                  <h1 className={tw`text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent`}>
                    Dashboard de Fotos
                  </h1>
                  <div className={tw`flex items-center space-x-3 mt-2`}>
                    <div className={tw`w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg`}></div>
                    <p className={tw`text-gray-600 font-medium text-lg`}>Sistema ativo e monitorando</p>
                  </div>
                </div>
              </div>
              
              {/* Botões do Header */}
              <div className={tw`flex items-center gap-4 flex-wrap`}>
                <button
                  className={tw`
                    bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                    px-6 py-3 
                    rounded-xl hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900
                    shadow-lg hover:shadow-xl 
                    transition-all duration-300 ease-in-out 
                    flex items-center gap-3 
                    font-semibold text-base 
                    focus:outline-none focus:ring-4 focus:ring-blue-300
                    transform hover:scale-105
                  `}
                  onClick={() => {
                    const event = new CustomEvent('openCadastroModal');
                    window.dispatchEvent(event);
                  }}
                >
                  <svg className={tw`w-6 h-6`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Cadastrar Evento
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/logout', { method: 'POST' });
                      if (res.ok) {
                        window.location.href = '/routes/login';
                      } else {
                        alert('Erro ao sair, tente novamente.');
                      }
                    } catch {
                      alert('Erro ao sair, tente novamente.');
                    }
                  }}
                  className={tw`
                    flex items-center gap-3
                    bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800
                    text-white font-semibold py-3 px-6 rounded-xl
                    transition-all duration-300
                    shadow-lg hover:shadow-xl
                    focus:outline-none focus:ring-4 focus:ring-red-300
                    transform hover:scale-105
                  `}
                >
                  <svg className={tw`w-6 h-6`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
            
            <div className={tw`mt-6 lg:mt-8`}>
              <p className={tw`text-gray-700 text-lg lg:text-xl leading-relaxed max-w-4xl`}>
                Gerencie as fotos enviadas pelos usuários organizadas por eventos com nossa interface moderna e intuitiva. 
                Controle total sobre seus eventos e galeria de fotos em um só lugar.
              </p>
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <div className={tw`mb-8 fadeInUp`}>
          <div className={tw`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20`}>
            <Stats photos={photos} />
          </div>
        </div>

        {/* Filters Section */}
        <div className={tw`mb-8 fadeInUp`}>
          <div className={tw`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20`}>
            <Filters events={events} onFilter={handleFilter} />
          </div>
        </div>

        {/* Events Grid */}
        <div className={tw`fadeInUp`}>
          <div className={tw`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20`}>
            {isLoading ? (
              <div className={tw`flex flex-col items-center justify-center py-16`}>
                <div className={tw`animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4`}></div>
                <p className={tw`text-gray-600 text-lg font-medium`}>Carregando eventos...</p>
              </div>
            ) : (
              <EventGrid
                photos={filteredPhotos.slice(0, 13)}
                events={events}
                onPhotoDelete={handlePhotoDelete}
              />
            )}
          </div>
        </div>
      </div>

      <ModalCadastroEvento />
    </div>
  );
}