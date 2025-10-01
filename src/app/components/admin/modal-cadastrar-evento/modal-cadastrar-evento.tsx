'use client';
import React, { useState, useEffect } from 'react';
import { tw } from 'twind';
import axios from 'axios';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import { FiLoader } from 'react-icons/fi';

interface EventData {
  eventName: string;
  local: string;
  typeEvent: string;
  dataEvent: string;
  status: string;
}

interface ModalCadastroEventoProps {
  isOpen?: boolean;
  onClose?: () => void;
  onEventCreated?: () => void;
}

export default function ModalCadastroEvento({ isOpen = false, onClose, onEventCreated }: ModalCadastroEventoProps) {
  const [form, setForm] = useState({ eventName: '', local: '', typeEvent: '', dataEvent: '', status: 'ativo' });
  const [qrUrl, setQrUrl] = useState('');
  const [eventId, setEventId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado de loading
  const [internalIsOpen, setInternalIsOpen] = useState(false); // Para modo não controlado

  // Listener para abrir o modal via evento customizado (apenas se não controlado por props)
  useEffect(() => {
    if (onClose) return; // Se tem onClose, é controlado por props
    
    const handleOpenModal = () => {
      setInternalIsOpen(true);
    };
    
    window.addEventListener('openCadastroModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openCadastroModal', handleOpenModal);
    };
  }, [onClose]);

  const eventTypes = ["Casamento", "Aniversário", "Palestra", "Workshop", "Festa Corporativa", "Formatura", "Chá de Bebê", "Encontro Religioso", "Lançamento de Produto", "Show Musical"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.eventName || !form.local || !form.typeEvent || !form.dataEvent) {
      toast.warn('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Evita múltiplos cliques
    if (isLoading) return;

    try {
      setIsLoading(true); // Ativa o loading
      
      const response = await axios.post('/api/create-events', form);
      const { url, qrCodeGenerated } = response.data;

      toast.success('Evento cadastrado com sucesso!');
      setQrUrl(url);
      setEventId(response.data.id);

      if (qrCodeGenerated) {
        generateQrCodeForDisplay(url);
      }

      setForm({ eventName: '', local: '', typeEvent: '', dataEvent: '', status: 'ativo' });
      
      if (onEventCreated) {
        onEventCreated();
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

    } catch (error) {
      console.error('Erro ao cadastrar evento:', error);
      toast.error('Erro ao cadastrar evento. Tente novamente.');
    } finally {
      setIsLoading(false); // Desativa o loading
    }
  };

  // Gera QR Code apenas para exibição (já foi salvo no banco pela API)
  const generateQrCodeForDisplay = async (url: string) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, { width: 200 });
      setQrUrl(qrCodeDataURL);
    } catch (error) {
      console.error('Erro ao gerar QR Code para exibição:', error);
    }
  };

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  // Determinar se o modal deve estar aberto
  const modalIsOpen = onClose ? isOpen : internalIsOpen;

  if (!modalIsOpen) return null;

  return (
    <>
      <div
        className={tw`fixed inset-0 backdrop-blur-sm bg-black/30 z-[60]`}
        onClick={handleCloseModal}
      ></div>

      <div className={tw`fixed inset-0 flex items-center justify-center z-[70] px-4`}>
            <div
              className={tw`bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho */}
              <div className={tw`flex justify-between items-center mb-6`}>
                <h2 className={tw`text-2xl font-bold text-gray-800`}>Cadastrar Evento</h2>
                <button
                  onClick={handleCloseModal}
                  className={tw`text-gray-500 hover:text-gray-700 transition-colors`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={tw`h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Inputs */}
              <div className={tw`space-y-4`}>
                <div>
                  <label htmlFor="eventName" className={tw`block text-sm font-medium text-gray-700 mb-1`}>
                    Nome do Evento
                    <span className={tw`text-red-500`}>*</span>
                  </label>
                  <input
                    type="text"
                    id="eventName"
                    name="eventName"
                    placeholder="Ex: Conferência de Tecnologia"
                    value={form.eventName}
                    onChange={handleChange}
                    className={tw`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                  />
                </div>

                <div>
                  <label htmlFor="dataEvent" className={tw`block text-sm font-medium text-gray-700 mb-1`}>
                    Data do Evento
                    <span className={tw`text-red-500`}>*</span>
                  </label>
                  <input
                    type="date"
                    id="dataEvent"
                    name="dataEvent"
                    placeholder="Ex: 2023-09-15"
                    value={form.dataEvent}
                    onChange={handleChange}
                    className={tw`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                  />
                </div>

                <div>
                  <label htmlFor="local" className={tw`block text-sm font-medium text-gray-700 mb-1`}>
                    Local
                    <span className={tw`text-red-500`}>*</span>
                  </label>
                  <input
                    type="text"
                    id="local"
                    name="local"
                    placeholder="Ex: Centro de Convenções"
                    value={form.local}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={tw`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>

                <div>
                  <label htmlFor="typeEvent" className={tw`block text-sm font-medium text-gray-700 mb-1`}>
                    Tipo de Evento
                    <span className={tw`text-red-500`}>*</span>
                  </label>
                  <select
                    id="typeEvent"
                    name="typeEvent"
                    value={form.typeEvent}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={tw`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="" disabled>Selecione o tipo de evento</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className={tw`block text-sm font-medium text-gray-700 mb-1`}>
                    Status
                    <span className={tw`text-red-500`}>*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={tw`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Botões */}
              <div className={tw`flex justify-end flex-wrap gap-3 mt-6`}>
                <button
                  className={tw`px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  className={tw`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 ${isLoading ? 'opacity-75 cursor-not-allowed bg-blue-500' : ''}`}
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className={tw`animate-spin w-4 h-4`} />
                      Cadastrando...
                    </>
                  ) : (
                    'Cadastrar'
                  )}
                </button>
              </div>
            </div>
          </div>
    </>
  );
}