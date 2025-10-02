'use client';
import { tw } from 'twind';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Photo } from '@/types/photo';
import Sidebar from '../sidebar/sidebar';
import Header from '../header/header';
import Image from "next/image";
import PhotoExpandedModal from '../modal-expanded-photo/modal-expanded-photo';
import { FaImage, FaUser } from 'react-icons/fa';
import { TbTargetArrow } from "react-icons/tb";

export default function GaleriaFotos() {
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [searchName, setSearchName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);

  const handlePhotoDelete = () => {
    // Recarregar os dados após exclusão
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [photos, selectedEvent, searchName]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar eventos
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('createdAt', 'desc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        eventId: doc.id,
        ...doc.data()
      })) as Event[];

      // Carregar fotos
      const photosQuery = query(
        collection(db, 'photos'),
        orderBy('createdAt', 'desc')
      );
      const photosSnapshot = await getDocs(photosQuery);
      const photosData = photosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];

      setEvents(eventsData);
      setPhotos(photosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    let filtered = photos;

    // Filtrar por evento
    if (selectedEvent !== 'all') {
      filtered = filtered.filter(photo => photo.eventId === selectedEvent);
    }

    // Filtrar por nome do participante
    if (searchName.trim()) {
      filtered = filtered.filter(photo =>
        photo.userName?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    setFilteredPhotos(filtered);
  };

  const getUniqueParticipants = () => {
    const participants = new Set(filteredPhotos.map(photo => photo.userName).filter(Boolean));
    return participants.size;
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(e.target.value);
  };

  return (
    <div className={tw`min-h-screen bg-gray-50 flex`}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className={tw`flex-1 lg:ml-0`}>
        <div className={tw`p-4 sm:p-6`}>
          {/* Mobile Menu Button */}
          {!isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={tw`lg:hidden fixed top-4 left-4 z-30 bg-white p-2 rounded-lg shadow-lg border border-gray-200`}
            >
              <svg className={tw`w-6 h-6 text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          {/* Header */}
          <Header
            title="Galeria de Fotos"
            subtitle="Visualize todas as fotos enviadas pelos participantes"
          />

          {/* Filters */}
          <div className={tw`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6 mx-2 sm:mx-0`}>
            <div className={tw`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6`}>
              {/* Filter by Event */}
              <div>
                <label className={tw`block text-sm font-medium text-gray-700 mb-2`}>
                  Filtrar por Evento
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => handleEventChange(e.target.value)}
                  className={tw`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all`}
                >
                  <option value="all">Todos os Eventos</option>
                  {events.map(event => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search by Name */}
              <div>
                <label className={tw`block text-sm font-medium text-gray-700 mb-2`}>
                  Buscar por Nome
                </label>
                <div className={tw`relative`}>
                  <input
                    type="text"
                    value={searchName}
                    onChange={handleSearchChange}
                    placeholder="Digite o nome do participante..."
                    className={tw`w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all`}
                  />
                  <svg className={tw`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className={tw`grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 mx-2 sm:mx-0`}>
            <div className={tw`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 text-center`}>
              <div className={tw`text-3xl sm:text-4xl mb-2 text-[#9D6433] flex justify-center`}><FaImage /></div>
              <div className={tw`text-2xl sm:text-3xl font-bold text-gray-900 mb-1`}>{filteredPhotos.length}</div>
              <div className={tw`text-xs sm:text-sm text-gray-600`}>Fotos Encontradas</div>
            </div>

            <div className={tw`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 text-center`}>
              <div className={tw`text-3xl sm:text-4xl mb-2 text-blue-600 flex justify-center`}><FaUser /></div>
              <div className={tw`text-2xl sm:text-3xl font-bold text-gray-900 mb-1`}>{getUniqueParticipants()}</div>
              <div className={tw`text-xs sm:text-sm text-gray-600`}>Participantes</div>
            </div>

            <div className={tw`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 text-center`}>
              <div className={tw`text-3xl sm:text-4xl mb-2 text-green-600 flex justify-center`}><TbTargetArrow /></div>
              <div className={tw`text-2xl sm:text-3xl font-bold text-gray-900 mb-1`}>{events.length}</div>
              <div className={tw`text-xs sm:text-sm text-gray-600`}>Eventos Totais</div>
            </div>
          </div>

          {/* Photos Grid */}
          <div className={tw`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mx-2 sm:mx-0 overflow-hidden`}>
            {loading ? (
              <div className={tw`flex items-center justify-center py-8 sm:py-12`}>
                <div className={tw`animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600`}></div>
              </div>
            ) : filteredPhotos.length === 0 ? (
              <div className={tw`text-center py-8 sm:py-12`}>
                <div className={tw`w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-purple-100 rounded-full flex items-center justify-center`}>
                  <svg className={tw`w-8 h-8 sm:w-12 sm:h-12 text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={tw`text-lg sm:text-xl font-semibold text-gray-900 mb-2`}>Nenhuma foto ainda</h3>
                <p className={tw`text-sm sm:text-base text-gray-600 px-4`}>As fotos enviadas pelos participantes aparecerão aqui</p>
              </div>
            ) : (
              <div className={tw`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 w-full max-w-full`}>
                {filteredPhotos.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className={tw`group relative bg-gray-100 rounded-lg overflow-hidden aspect-square hover:shadow-lg transition-all duration-200 cursor-pointer`}
                    onClick={() => setCurrentPhotoIndex(index)}
                  >
                    <Image
                      src={photo.url}
                      alt={`Foto de ${photo.userName || 'Participante'}`}
                      width={500}
                      height={500}
                      className={tw`w-full h-full object-cover group-hover:scale-105 transition-transform duration-200`}
                    />
                    <div className={tw`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-end`}>
                      <div className={tw`p-2 sm:p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-200`}>
                        <p className={tw`text-xs sm:text-sm font-medium truncate`}>{photo.userName || 'Anônimo'}</p>
                        <p className={tw`text-xs opacity-75 hidden sm:block`}>
                          {photo.createdAt && new Date(photo.createdAt.toDate()).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para exibir foto expandida */}
      {currentPhotoIndex !== null && (
        <PhotoExpandedModal
          photos={filteredPhotos}
          currentIndex={currentPhotoIndex}
          onClose={() => setCurrentPhotoIndex(null)}
          onPrev={() => setCurrentPhotoIndex((prev) => 
            prev !== null ? (prev - 1 + filteredPhotos.length) % filteredPhotos.length : prev
          )}
          onNext={() => setCurrentPhotoIndex((prev) => 
            prev !== null ? (prev + 1) % filteredPhotos.length : prev
          )}
          onPhotoDelete={handlePhotoDelete}
        />
      )}
    </div>
  );
}