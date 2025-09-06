'use client';
import { useState, useEffect } from 'react';
import { tw } from 'twind';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiLoader } from 'react-icons/fi';
import { Event } from '@/types/event';
import { Timestamp } from 'firebase/firestore';

interface EventData {
  eventName: string;
  local: string;
  typeEvent: string;
  dataEvent: string;
  status: string;
}

interface ModalEditarEventoProps {
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated?: () => void;
  event: Event;
}

export default function ModalEditarEvento({ isOpen, onClose, onEventUpdated, event }: ModalEditarEventoProps) {
  const [form, setForm] = useState<EventData>({
    eventName: '',
    local: '',
    typeEvent: '',
    dataEvent: '',
    status: 'ativo'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Preencher o formulário com os dados do evento quando o modal abrir
  useEffect(() => {
    if (isOpen && event) {
      const formatDateForInput = (timestamp?: Timestamp | Date) => {
        if (!timestamp) return '';
        
        try {
          const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      setForm({
        eventName: event.eventName || '',
        local: event.local || '',
        typeEvent: event.typeEvent || '',
        dataEvent: formatDateForInput(event.dataEvent),
        status: event.status || 'ativo'
      });
    }
  }, [isOpen, event]);

  const eventTypes = ["Casamento", "Aniversário", "Palestra", "Workshop", "Festa Corporativa", "Formatura", "Chá de Bebê", "Encontro Religioso", "Lançamento de Produto", "Show Musical"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.eventName || !form.local || !form.typeEvent || !form.dataEvent) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put(`/api/events/${event.eventId}`, {
        eventName: form.eventName,
        local: form.local,
        typeEvent: form.typeEvent,
        dataEvent: form.dataEvent,
        status: form.status
      });

      if (response.status === 200) {
        toast.success('Evento atualizado com sucesso!');
        onEventUpdated?.();
        handleClose();
      }
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast.error('Erro ao atualizar evento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ eventName: '', local: '', typeEvent: '', dataEvent: '', status: 'ativo' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={tw`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
      <div className={tw`bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}>
        <div className={tw`p-6`}>
          <div className={tw`flex justify-between items-center mb-6`}>
            <h2 className={tw`text-2xl font-bold text-gray-900`}>Editar Evento</h2>
            <button
              onClick={handleClose}
              className={tw`text-gray-400 hover:text-gray-600 text-2xl`}
              disabled={isLoading}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className={tw`space-y-4`}>
            <div>
              <label className={tw`block text-sm font-medium text-gray-700 mb-2`}>
                Nome do Evento *
              </label>
              <input
                type="text"
                name="eventName"
                value={form.eventName}
                onChange={handleChange}
                className={tw`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Digite o nome do evento"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className={tw`block text-sm font-medium text-gray-700 mb-2`}>
                Data do Evento *
              </label>
              <input
                type="date"
                name="dataEvent"
                value={form.dataEvent}
                onChange={handleChange}
                className={tw`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className={tw`block text-sm font-medium text-gray-700 mb-2`}>
                Local do Evento *
              </label>
              <input
                type="text"
                name="local"
                value={form.local}
                onChange={handleChange}
                className={tw`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Digite o local do evento"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className={tw`block text-sm font-medium text-gray-700 mb-2`}>
                Tipo de Evento *
              </label>
              <select
                name="typeEvent"
                value={form.typeEvent}
                onChange={handleChange}
                className={tw`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                disabled={isLoading}
              >
                <option value="">Selecione o tipo de evento</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={tw`block text-sm font-medium text-gray-700 mb-2`}>
                Status *
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={tw`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
                disabled={isLoading}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            <div className={tw`flex gap-3 pt-4`}>
              <button
                type="button"
                onClick={handleClose}
                className={tw`flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors`}
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={tw`flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <FiLoader className={tw`animate-spin`} />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}