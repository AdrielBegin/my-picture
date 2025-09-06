'use client';
import { tw } from 'twind';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Photo } from '@/types/photo';
import Sidebar from '../sidebar/sidebar';
import Header from '../header/header';
import ModernEventCard from '../modern-event-card/modern-event-card';
import ModalCadastroEvento from '../modal-cadastrar-evento/modal-cadastrar-evento';

export default function MeusEventos() {
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCadastroModal, setShowCadastroModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Listener para abrir modal quando navegado de outras páginas
  useEffect(() => {
    const handleOpenModal = () => {
      setShowCadastroModal(true);
    };

    window.addEventListener('openCadastroModal', handleOpenModal);

    return () => {
      window.removeEventListener('openCadastroModal', handleOpenModal);
    };
  }, []);

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

  const getEventPhotos = (eventId: string) => {
    return photos.filter(photo => photo.eventId === eventId);
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.eventId !== eventId));
    setPhotos(prev => prev.filter(photo => photo.eventId !== eventId));
  };

  const handleEventUpdated = () => {
    loadData(); // Recarregar dados após atualização
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
      <div className={tw`flex-1`}>
        <div className={tw`p-4 sm:p-6`}>
          {/* Mobile Menu Button */}
          {!isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={tw`lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors`}
            >
              <svg className={tw`w-6 h-6 text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Header */}
          <Header
            title="Meus Eventos"
            subtitle="Crie eventos e permita que convidados enviem fotos"
            onNewEvent={() => setShowCadastroModal(true)}
          />

          {/* Events Grid */}
          <div className={tw`mb-6`}>
            {loading ? (
              <div className={tw`flex items-center justify-center py-8 sm:py-12`}>
                <div className={tw`animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600`}></div>
              </div>
            ) : events.length === 0 ? (
              <div className={tw`text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-100 mx-2 sm:mx-0`}>
                <div className={tw`text-4xl sm:text-6xl mb-3 sm:mb-4`}>🎯</div>
                <h3 className={tw`text-lg sm:text-xl font-semibold text-gray-900 mb-2`}>Nenhum evento cadastrado</h3>
                <p className={tw`text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4`}>Comece criando seu primeiro evento</p>
                <button
                  onClick={() => setShowCadastroModal(true)}
                  className={tw`
                    bg-gradient-to-r from-purple-600 to-blue-600 text-white
                    px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold
                    hover:from-purple-700 hover:to-blue-700
                    transition-all duration-200 text-sm sm:text-base
                    mx-4 sm:mx-0
                  `}
                >
                  Criar Primeiro Evento
                </button>
              </div>
            ) : (
              <div className={tw`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6`}>
                {events.map(event => (
                  <ModernEventCard
                    key={event.eventId}
                    event={event}
                    photos={getEventPhotos(event.eventId)}
                    onEventDelete={handleEventDelete}
                    onEventUpdated={handleEventUpdated}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cadastro */}
      {showCadastroModal && (
        <ModalCadastroEvento
          isOpen={showCadastroModal}
          onClose={() => setShowCadastroModal(false)}
          onEventCreated={() => {
            loadData();
            setShowCadastroModal(false);
          }}
        />
      )}
    </div>
  );
}