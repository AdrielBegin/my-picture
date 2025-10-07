'use client';
import { tw } from 'twind';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { Photo } from '@/types/photo';
import Sidebar from '../sidebar/sidebar';
import Header from '../header/header';
import StatsCard from '../stats-card/stats-card';
import ModalCadastroEvento from '../modal-cadastrar-evento/modal-cadastrar-evento';
import { SiTarget } from 'react-icons/si';
import { FaCalendar, FaClock, FaImage, FaUser } from 'react-icons/fa';
import { TbTargetArrow } from 'react-icons/tb';

export default function ModernDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar eventos
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('dataEvent', 'desc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        eventId: doc.id,
        ...doc.data()
      })) as Event[];

      // Carregar fotos
      const photosSnapshot = await getDocs(collection(db, 'photos'));
      const photosData = photosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Photo[];
      
      // Ordenar por createdAt se existir
      photosData.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });

      setEvents(eventsData);
      setPhotos(photosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listener para abrir modal de cadastro
    const handleOpenCadastro = () => setShowCadastroModal(true);
    window.addEventListener('openCadastroModal', handleOpenCadastro);

    return () => {
      window.removeEventListener('openCadastroModal', handleOpenCadastro);
    };
  }, []);

  const getEventPhotos = (eventId: string) => {
    return photos.filter(photo => photo.eventId === eventId);
  };

  const getLastPhotoDate = () => {
    if (photos.length === 0) return 'Nenhuma foto';

    const lastPhoto = photos[0]; // já ordenado por createdAt desc
    if (lastPhoto.createdAt) {
      const date = lastPhoto.createdAt.toDate();
      return date.toLocaleDateString('pt-BR');
    }
    return 'Data não disponível';
  };

  const getTopSender = () => {
    if (photos.length === 0) return 'Nenhum usuário';

    const senderCounts = photos.reduce((acc, photo) => {
      const sender = photo.userName || 'Anônimo';
      acc[sender] = (acc[sender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSender = Object.entries(senderCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return topSender ? topSender[0] : 'Nenhum usuário';
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
        onToggleCollapse={() => {
          setSidebarCollapsed(!sidebarCollapsed);
        }}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className={tw`flex-1 ml-0 lg:${sidebarCollapsed ? 'ml-16' : 'ml-6'}`}>
        <div className={tw`p-2 sm:p-4 lg:p-3`}>
          {/* Mobile Menu Button */}
          {!isMobileMenuOpen && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={tw`lg:hidden mb-4 p-2 bg-white rounded-lg shadow-sm border border-gray-200`}
            >
              <span className={tw`text-gray-600 text-xl`}>☰</span>
            </button>
          )}
          {/* Header */}
          <Header
            title="Dashboard"
            subtitle="Gerencie seus eventos e acompanhe as estatísticas"
            onNewEvent={() => setShowCadastroModal(true)}
          />

          {/* Stats Cards */}
          <div className={tw`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6`}>
            <StatsCard
              title="Total de Eventos"
              value={events.length}
              subtitle="eventos cadastrados"
              icon={<SiTarget />}
              color="blue"
            />

            <StatsCard
              title="Total de Fotos"
              value={photos.length}
              subtitle="fotos enviadas"
              icon={<FaImage />}
              color="green"
            />

            <StatsCard
              title="Última Foto"
              value={getLastPhotoDate()}
              subtitle="data do último envio"
              icon={<FaClock />}
              color="purple"
            />

            <StatsCard
              title="Top Usuário"
              value={getTopSender()}
              subtitle="maior contribuidor"
              icon={<FaUser />}
              color="orange"
            />
          </div>

          {/* Events List */}
          <div className={tw`mb-6`}>
            <div className={tw`flex items-center gap-3 mb-4 sm:mb-6`}>
              <div className={tw`text-[#9D6433] text-xl`}><FaCalendar /></div>
              <h2 className={tw`text-xl sm:text-2xl font-bold text-gray-900`}>Eventos Recentes</h2>
            </div>

            {loading ? (
              <div className={tw`flex items-center justify-center py-8 sm:py-12`}>
                <div className={tw`animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-600`}></div>
              </div>
            ) : events.length === 0 ? (
              <div className={tw`text-center py-8 sm:py-12 bg-white rounded-xl border border-gray-100`}>
                <div className={tw`text-4xl sm:text-6xl mb-4 flex justify-center text-purple-600`}><TbTargetArrow /></div>
                <h3 className={tw`text-lg sm:text-xl font-semibold text-gray-900 mb-2`}>Nenhum evento cadastrado</h3>
                <p className={tw`text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base`}>Comece criando seu primeiro evento</p>
                <button
                  onClick={() => setShowCadastroModal(true)}
                  className={tw`
                    bg-gradient-to-r from-purple-600 to-blue-600 text-white
                    px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold
                    hover:from-purple-700 hover:to-blue-700
                    transition-all duration-200
                    text-sm sm:text-base
                  `}
                >
                  Criar Primeiro Evento
                </button>
              </div>
            ) : (
              <div className={tw`bg-white rounded-xl border border-gray-100 overflow-hidden`}>
                {events.slice(0, 5).map((event, index) => {
                  
                  const eventPhotos = getEventPhotos(event.eventId);

                  const formatDate = (dateValue: Date | string | Timestamp) => {  
                    if (!dateValue) return 'Data não disponível';
                    
                    let date: Date;
                    if (dateValue instanceof Timestamp && typeof dateValue.toDate === 'function') {
                      // Firebase Timestamp
                      date = dateValue.toDate();
                    } else if (typeof dateValue === 'string') {
                      date = new Date(dateValue);
                    } else {
                      return 'Data inválida';
                    }
                    
                    return date.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    });
                  };
                  
                  const getStatusBadge = (status: string) => {
                    const isActive = status === 'ativo';
                    return (
                      <span className={tw`px-2 py-1 rounded-full text-xs font-medium ${
                        isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isActive ? 'Ativo' : 'Finalizado'}
                      </span>
                    );
                  };

                  return (
                    <div key={event.eventId} className={tw`${
                      index !== events.length - 1 && index !== 4 ? 'border-b border-gray-100' : ''
                    } p-4 hover:bg-gray-50 transition-colors`}>
                      <div className={tw`flex items-center justify-between`}>
                        <div className={tw`flex-1`}>
                          <div className={tw`flex items-center gap-3 mb-2 min-w-0`}>
                            <h3 className={tw`font-semibold text-gray-900 text-sm sm:text-base truncate`}>
                              {event.eventName}
                            </h3>
                            {getStatusBadge(event.status || 'ativo')}
                          </div>
                          <div className={tw`text-xs sm:text-sm text-gray-600 space-y-1`}>
                            <div>{formatDate(event.dataEvent || new Date())}</div>
                            {event.local && (
                              <div className={tw`truncate`}>{event.local}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className={tw`text-right`}>
                          <div className={tw`text-sm font-medium text-gray-900`}>
                            {eventPhotos.length} fotos
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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