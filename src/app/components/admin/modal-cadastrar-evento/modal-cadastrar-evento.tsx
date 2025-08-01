//app/components/admin/modal-cadastrar-evento/modal-cadastrar-evento.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { tw } from 'twind';
import axios from 'axios';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';

export default function ModalCadastroEvento() {
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({ eventName: '', local: '', typeEvent: '' });

  const [qrUrl, setQrUrl] = useState('');

  const eventTypes = ["Casamento", "Aniversário", "Palestra", "Workshop", "Festa Corporativa", "Formatura", "Chá de Bebê", "Encontro Religioso", "Lançamento de Produto", "Show Musical",];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {

    if (!form.eventName || !form.local || !form.typeEvent) {
      toast.warn('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    try {
      const response = await axios.post('/api/create-events', form);
      const { url } = response.data;

      setQrUrl(url);
      setForm({ eventName: '', local: '', typeEvent: '' });
      setIsOpen(false);

      toast.success('Evento cadastrado com sucesso!');

    } catch (error) {
      toast.error('Erro ao cadastrar evento. Tente novamente.');
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (qrUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrUrl, { width: 200 }, (error) => {
        if (error) console.error('Erro ao gerar QR Code:', error);
      });
    }
  }, [qrUrl]);

  return (
    <div className={tw`absolute top-10 right-6 z-50`}>
      <button
        className={tw`
            bg-blue-600 text-white 
            px-4 py-2 md:px-5 md:py-3 
            rounded-xl hover:bg-blue-700 active:bg-blue-800 
            shadow-lg hover:shadow-xl active:shadow-inner 
            transition duration-300 ease-in-out 
            flex items-center gap-2 md:gap-3 
            font-semibold text-sm md:text-base 
            select-none focus:outline-none focus:ring-4 focus:ring-blue-300
            `}
        onClick={() => setIsOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
          className="w-5 h-5 md:w-6 md:h-6"
          aria-hidden="true"
          focusable="false"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className={tw`hidden sm:inline`}>Cadastrar Evento</span>
      </button>

      {isOpen && (
        <>
          <div
            className={tw`fixed inset-0 backdrop-blur-sm bg-black/30 z-40`}
            onClick={() => setIsOpen(false)}
          ></div>

          <div className={tw`fixed inset-0 flex items-center justify-center z-50 px-4`}>
            <div
              className={tw`bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cabeçalho */}
              <div className={tw`flex justify-between items-center mb-6`}>
                <h2 className={tw`text-2xl font-bold text-gray-800`}>Cadastrar Evento</h2>
                <button
                  onClick={() => setIsOpen(false)}
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
                    className={tw`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
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
                    className={tw`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                  >
                    <option value="" disabled>Selecione o tipo de evento</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botões */}
              <div className={tw`flex justify-end flex-wrap gap-3 mt-6`}>
                <button
                  className={tw`px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300`}
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className={tw`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md`}
                  onClick={handleSubmit}
                >
                  Cadastrar
                </button>
              </div>
            </div>
          </div>
        </>
      )}{qrUrl && (
        <div className={tw`fixed bottom-10 right-6 bg-white p-4 rounded-xl shadow-xl text-center z-50`}>
          <h3 className={tw`text-lg font-semibold mb-2`}>QR Code do evento:</h3>
          <canvas ref={canvasRef} width={200} height={200} />
          <p className={tw`text-sm text-gray-500 mt-2 break-all`}>{qrUrl}</p>
        </div>
      )}
    </div>
  );
}