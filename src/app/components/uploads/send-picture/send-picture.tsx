'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CameraCapture from '../camera-capture/camera-capture';
import FileUpload from '../file-upload/file-upload';
import UploadStatus from '../upload-status/upload-status';
import { tw } from 'twind';
import ModalEventoNaoEncontrado from '../modal-evento-nao-encontrado/modal-evento-nao-encontrado';
import ModalAnimacaoVerificarEvento from '../modal-animacao-verificar-evento/modal-animacao-verificar-evento';

export default function SendPicture() {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [eventStatus, setEventStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');
    const [userName, setUserName] = useState('');
    const eventName = searchParams.get('eventName') || 'Evento Desconhecido';
    const [showCamera, setShowCamera] = useState(false);    

    useEffect(() => {
        const validateEvent = async () => {
            if (!eventId) {
                setEventStatus('invalid');
                console.error('Evento ID não encontrado');
                return;
            }

            try {                
                const response = await fetch(`/api/get-event/${eventId}`);
                
                if (response.ok) {
                    setEventStatus('valid');
                } else {
                    setEventStatus('invalid');
                }
            } catch (error) {
                console.error('Erro ao validar evento:', error);
                setEventStatus('invalid');
            }
        };

        validateEvent();
    }, [eventId]);

    const handleUpload = async (file: File) => {

        if (eventStatus !== 'valid') {
            setUploadStatus('error');
            return;
        }

        try {
            const formData = new FormData();

            if (userName) {
                formData.append('userName', userName);
            }

            setUploadStatus('loading');

            formData.append('file', file);
            if (eventId) {
                formData.append('eventId', eventId);
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploadStatus('success');
            } else {
                setUploadStatus('error');
            }
        } catch (error) {
            setUploadStatus('error');
        }
    };

    const handleStartCamera = () => {
        setShowCamera(true);
    };
    if (eventStatus === 'loading') {
        return (
            <ModalAnimacaoVerificarEvento />
        );
    }

    if (eventStatus === 'invalid') {
        return (
            <ModalEventoNaoEncontrado />
        );
    }

    return (
        <div className={tw`min-h-screen bg-gray-100 flex items-center py-4 px-4`}>
            <div className={tw`max-w-md w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden p-5`}>
                <div className={tw`space-y-4`}>
                    <div className={tw`text-xl font-bold text-center text-green-500 mb-4`}>
                        <h1>{eventName}</h1>
                    </div>
                    <h1 className={tw`text-xl font-bold text-center text-indigo-600 mb-4`}>
                        📸 Envie sua foto!
                    </h1>

                    <div>
                        <label htmlFor="nome" className={tw`block font-medium text-gray-700 mb-1`}>
                            Seu nome
                        </label>
                        <input
                            type="text"
                            id="nome"
                            name="nome"
                            placeholder="Ex: Maria da Silva"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className={tw`mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                        />
                    </div>
                </div>

                <div className={tw`space-y-4 mt-6`}>
                    <button
                        onClick={handleStartCamera}
                        className={tw`w-full py-3 px-4 rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={tw`h-5 w-5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Tirar foto
                    </button>

                    <div className={tw`relative flex items-center`}>
                        <div className={tw`flex-grow border-t border-gray-300`}></div>
                        <span className={tw`flex-shrink mx-4 text-gray-400 text-sm`}>ou</span>
                        <div className={tw`flex-grow border-t border-gray-300`}></div>
                    </div>

                    <FileUpload onUpload={handleUpload} />

                    {showCamera && (
                        <CameraCapture
                            onCapture={handleUpload}
                            onClose={() => setShowCamera(false)}
                        />
                    )}

                    <UploadStatus status={uploadStatus} />

                    {uploadStatus === 'success' && (
                        <button
                            onClick={() => setUploadStatus('idle')}
                            className={tw`w-full py-3 px-4 rounded text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mt-4`}
                        >
                            Enviar outra foto
                        </button>
                    )}
                </div>

                <p className={tw`text-xs text-gray-500 text-center mt-6`}>
                    Sua foto será compartilhada com os organizadores do evento.
                </p>
            </div>
        </div>
    );
}