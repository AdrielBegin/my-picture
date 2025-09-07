'use client';
import { tw } from 'twind';
import { Event } from '@/types/event';
import { Photo } from '@/types/photo';
import { useState } from 'react';
import ModalQRCode from '../modal-qr-code/modal-qr-code';
import ModalDeleteEvent from '../modal-delete-event/modal-delete-event';
import ModalEditarEvento from '../modal-editar-evento/modal-editar-evento';
import { Timestamp } from "firebase/firestore";
import { FiLink } from "react-icons/fi";
import { FaCalendarAlt } from 'react-icons/fa';
import { FaLocationDot } from "react-icons/fa6";
import { SiTarget } from "react-icons/si";

interface ModernEventCardProps {
  event: Event;
  photos: Photo[];
  onEventDelete?: (eventId: string) => void;
  onEventUpdated?: () => void;
}

export default function ModernEventCard({ event, photos, onEventDelete, onEventUpdated }: ModernEventCardProps) {
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatDate = (timestamp?: Timestamp | Date) => {
    if (!timestamp) return "Data não definida";

    try {
      const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Data inválida";
    }
  };

  const getStatusColor = () => {
    if (event.status === 'inativo') {
      return 'bg-red-100 text-red-700';
    }

    if (event.status === 'ativo') {
      return 'bg-green-100 text-green-700';
    }

    if (!event.dataEvent) return 'bg-gray-100 text-gray-600';

    const eventDate = event.dataEvent.toDate();
    const today = new Date();

    return eventDate > today
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-600';
  };

  const getStatusText = () => {
    if (event.status === 'inativo') {
      return 'Inativo';
    }

    if (event.status === 'ativo') {
      return 'Ativo';
    }

    if (!event.dataEvent) return 'Finalizado';

    const eventDate = event.dataEvent.toDate();
    const today = new Date();

    return eventDate > today ? 'Ativo' : 'Finalizado';
  };


  const handleQRCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQRCodeModal(true);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  return (
    <>
      <div className={tw`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200`}>
        {/* Header do Card */}
        <div className={tw`flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 sm:gap-0`}>
          <div className={tw`flex-1`}>
            <div className={tw`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2`}>
              <h3 className={tw`text-lg sm:text-xl font-bold text-gray-900`}>{event.eventName}</h3>
              <span className={tw`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()} self-start sm:self-auto`}>
                {getStatusText()}
              </span>
            </div>

            <div className={tw`space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600`}>
              <div className={tw`flex items-center gap-2`}>
                <span className={tw`text-gray-900`}><FaCalendarAlt   /></span>
                <span>{formatDate(event.dataEvent)}</span>
              </div>

              {event.local && (
                <div className={tw`flex items-center gap-2`}>
                  <span className={tw`text-gray-900`}><FaLocationDot /></span>
                  <span className={tw`truncate`}>{event.local}</span>
                </div>
              )}

              {event.typeEvent && (
                <div className={tw`flex items-center gap-2`}>
                  <span className={tw`text-gray-900`}><SiTarget /></span>
                  <span>{event.typeEvent}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className={tw`grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6`}>
          <div className={tw`text-center p-2 sm:p-3 bg-gray-50 rounded-lg`}>
            <div className={tw`text-xl sm:text-2xl font-bold text-gray-900`}>{photos.length}</div>
            <div className={tw`text-xs sm:text-sm text-gray-600`}>fotos</div>
          </div>

          <div className={tw`text-center p-2 sm:p-3 bg-gray-50 rounded-lg`}>
            <div className={tw`text-xl sm:text-2xl font-bold text-gray-900`}>
              {new Set(photos.map(p => p.userName)).size}
            </div>
            <div className={tw`text-xs sm:text-sm text-gray-600`}>pessoas</div>
          </div>
        </div>

        {/* Ações */}
        <div className={tw`flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2`}>
          <button
            onClick={handleQRCode}
            className={tw`
              flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-purple-50 text-purple-700 rounded-lg
              hover:bg-purple-100 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none
            `}
          >
            <svg className={tw`w-4 h-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span className={tw`hidden xs:inline sm:inline`}>QR Code</span>
          </button>
          <a
            href={event.urlQrCode || '#'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir link gerado para o evento"
            title="Abrir link do evento"
            className={tw`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg
              hover:bg-yellow-100 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none`}
          >
            <FiLink size={16} />
            <span className={tw`hidden sm:inline`}>Link</span>
          </a>

          <button
            onClick={handleEdit}
            className={tw`flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg
              hover:bg-blue-100 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none
            `}
          >
            <svg className={tw`w-4 h-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className={tw`hidden xs:inline sm:inline`}>Editar</span>
          </button>

          <button
            onClick={handleDelete}
            className={tw`
              flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-700 rounded-lg
              hover:bg-red-100 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none
            `}
          >
            <svg className={tw`w-4 h-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className={tw`hidden xs:inline sm:inline`}>Excluir</span>
          </button>
        </div>
      </div>

      {/* Modais */}
      {showQRCodeModal && (
        <ModalQRCode
          isOpen={showQRCodeModal}
          eventId={event.eventId}
          eventName={event.eventName || ''}
          eventUrl={event.urlQrCode || ''}
          onClose={() => setShowQRCodeModal(false)}
        />
      )}

      {showDeleteModal && (
        <ModalDeleteEvent photoCount={photos.length}
          isOpen={showDeleteModal}
          eventId={event.eventId}
          eventName={event.eventName || ''}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            onEventDelete?.(event.eventId);
            setShowDeleteModal(false);
          }}
        />
      )}

      {showEditModal && (
        <ModalEditarEvento
          isOpen={showEditModal}
          event={event}
          onClose={() => setShowEditModal(false)}
          onEventUpdated={() => {
            onEventUpdated?.();
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
}