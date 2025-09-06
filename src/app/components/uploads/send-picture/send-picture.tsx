'use client';
import { tw } from 'twind';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CameraCapture from '../camera-capture/camera-capture';
import FileUpload from '../file-upload/file-upload';
import UploadStatus from '../upload-status/upload-status';
import ModalEventoNaoEncontrado from '../modal-evento-nao-encontrado/modal-evento-nao-encontrado';
import ModalAnimacaoVerificarEvento from '../modal-animacao-verificar-evento/modal-animacao-verificar-evento';
import Image from "next/image";

export default function SendPicture() {

    
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [eventStatus, setEventStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
    const searchParams = useSearchParams();
    const eventId = searchParams!.get('eventId');
    const [userName, setUserName] = useState('');
    const eventName = searchParams!.get('eventName') || 'Evento Desconhecido';
    const [showCamera, setShowCamera] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [nameValidation, setNameValidation] = useState<{
        isValid: boolean;
        message: string;
        type: 'success' | 'error' | 'warning' | 'idle';
    }>({ isValid: false, message: '', type: 'idle' });

    useEffect(() => {
        const validateEvent = async () => {
            if (!eventId) {
                setEventStatus('invalid');
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
                setEventStatus('invalid');
            }
        };

        validateEvent();
    }, [eventId]);

    useEffect(() => {
        if (userName.length === 0) {
            setNameValidation({ isValid: false, message: '', type: 'idle' });
            return;
        }

        if (userName.length < 2) {
            setNameValidation({
                isValid: false,
                message: 'Nome muito curto (mínimo 2 caracteres)',
                type: 'error'
            });
            return;
        }

        if (userName.length > 50) {
            setNameValidation({
                isValid: false,
                message: 'Nome muito longo (máximo 50 caracteres)',
                type: 'error'
            });
            return;
        }

        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(userName)) {
            setNameValidation({
                isValid: false,
                message: 'Use apenas letras e espaços',
                type: 'error'
            });
            return;
        }

        if (userName.trim().split(' ').length < 2) {
            setNameValidation({
                isValid: true,
                message: 'Considere adicionar seu sobrenome',
                type: 'warning'
            });
            return;
        }

        setNameValidation({
            isValid: true,
            message: 'Nome válido!',
            type: 'success'
        });
    }, [userName]);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async (file?: File) => {
        const fileToUpload = file || selectedFile;

        if (!fileToUpload) {
            setUploadStatus('error');
            return;
        }

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

            formData.append('file', fileToUpload);
            if (eventId) {
                formData.append('eventId', eventId);
            }

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploadStatus('success');
                setPreviewImage(null);
                setSelectedFile(null);
            } else {
                setUploadStatus('error');
            }
        } catch (error) {
            setUploadStatus('error');
        }
    };

    const handleCancelPreview = () => {
        setPreviewImage(null);
        setSelectedFile(null);
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
        <div className={tw`min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center py-4 px-4 sm:px-6 lg:px-8`}>
            <div className={tw`max-w-md w-full mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transform transition-all duration-500 ease-in-out`}>
                <div className={tw`bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 text-white text-center transform transition-all duration-300`}>
                    <div className={tw`mb-2`}>
                        <div className={tw`inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-3 animate-pulse`}>
                            <svg className={tw`w-8 h-8`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className={tw`text-base sm:text-lg font-semibold mb-1 opacity-90`}>{eventName}</h2>
                    <h1 className={tw`text-xl sm:text-2xl font-bold flex items-center justify-center gap-2`}>
                        <span className={tw`text-3xl animate-bounce`}>📸</span>
                        Envie sua foto!
                    </h1>
                </div>

                <div className={tw`p-4 sm:p-6 space-y-4 sm:space-y-6`}>

                    <div className={tw`relative transform transition-all duration-300`}>
                        <label htmlFor="nome" className={tw`block font-semibold text-gray-700 mb-2 flex items-center gap-2`}>
                            <svg className={tw`w-4 h-4 text-indigo-500`} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                            Seu nome
                        </label>
                        <div className={tw`relative space-y-2`}>
                            <div className={tw`relative`}>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    placeholder="Ex: Maria da Silva"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className={tw`w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border-2 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 bg-gray-50 focus:bg-white text-sm sm:text-base transform hover:scale-[1.01] ${nameValidation.type === 'success' ? 'border-green-400 focus:border-green-500 focus:ring-green-300' :
                                        nameValidation.type === 'error' ? 'border-red-400 focus:border-red-500 focus:ring-red-300' :
                                            nameValidation.type === 'warning' ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-300' :
                                                'border-gray-200 focus:border-indigo-500 focus:ring-indigo-300'
                                        }`}
                                />
                                <div className={tw`absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 transition-all duration-300`}>
                                    {nameValidation.type === 'success' && (
                                        <svg className={tw`w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                    )}
                                    {nameValidation.type === 'error' && (
                                        <svg className={tw`w-4 h-4 sm:w-5 sm:h-5 text-red-500 animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                    )}
                                    {nameValidation.type === 'warning' && (
                                        <svg className={tw`w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 animate-pulse`} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                                        </svg>
                                    )}
                                    {nameValidation.type === 'idle' && userName && (
                                        <svg className={tw`w-4 h-4 sm:w-5 sm:h-5 text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>
                            </div>

                            {nameValidation.message && (
                                <div className={tw`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 transform ${nameValidation.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
                                    nameValidation.type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                                        nameValidation.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                            'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}>
                                    <span className={tw`font-medium`}>{nameValidation.message}</span>
                                </div>
                            )}

                            <div className={tw`text-xs text-gray-600 px-1 transition-all duration-300`}>
                                {userName.length}/50 caracteres
                            </div>
                        </div>
                    </div>

                    <div className={tw`space-y-3 sm:space-y-4 transform transition-all duration-500`}>
                        <button
                            onClick={() => setShowCamera(true)}
                            className={tw`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3`}
                        >
                            <svg className={tw`w-6 h-6`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Tirar foto
                        </button>

                        <div className={tw`relative flex items-center my-6`}>
                            <div className={tw`flex-grow border-t border-gray-200`}></div>
                            <span className={tw`flex-shrink mx-4 text-gray-500 text-sm font-medium bg-white px-3 py-1 rounded-full border border-gray-200`}>ou</span>
                            <div className={tw`flex-grow border-t border-gray-200`}></div>
                        </div>

                        <FileUpload onUpload={handleFileSelect} />

                        {showCamera && (
                            <CameraCapture
                                onCapture={handleUpload}
                                onClose={() => setShowCamera(false)}
                            />
                        )}

                        {/* Preview da imagem */}
                        {previewImage && (
                            <div className={tw`bg-white border-2 border-indigo-200 rounded-2xl p-3 sm:p-4 space-y-3 sm:space-y-4 shadow-lg transform transition-all duration-500 animate-fade-in`}>
                                <div className={tw`text-center`}>
                                    <h3 className={tw`text-lg font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2`}>
                                        <svg className={tw`w-5 h-5 text-indigo-500`} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 19V5c0-1.1-.9-2-2-2H5c0-1.1-.9-2-2-2s2 .9 2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                        </svg>
                                        Preview da sua foto
                                    </h3>
                                    <div className={tw`relative inline-block rounded-xl overflow-hidden shadow-md transform transition-all duration-300 hover:scale-[1.02]`}>

                                        <Image
                                            src={previewImage}
                                            alt="Preview"
                                            width={500}
                                            height={500}
                                            className={tw`max-w-full max-h-48 sm:max-h-64 object-contain transition-all duration-300`}
                                        />
                                    </div>
                                </div>

                                <div className={tw`flex gap-2 sm:gap-3`}>
                                    <button
                                        onClick={handleCancelPreview}
                                        className={tw`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base`}
                                    >
                                        <svg className={tw`w-4 h-4 sm:w-5 sm:h-5`} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                        </svg>
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleUpload()}
                                        disabled={uploadStatus === 'loading'}
                                        className={tw`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base`}
                                    >
                                        <svg className={tw`w-4 h-4 sm:w-5 sm:h-5`} fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                        </svg>
                                        {uploadStatus === 'loading' ? 'Enviando...' : 'Confirmar envio'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <UploadStatus status={uploadStatus} />

                        {uploadStatus === 'success' && (
                            <button
                                onClick={() => {
                                    setUploadStatus('idle');
                                    setPreviewImage(null);
                                    setSelectedFile(null);
                                }}
                                className={tw`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-xl text-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 focus:outline-none focus:ring-4 focus:ring-indigo-200 border-2 border-indigo-200 font-semibold transform transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base`}
                            >
                                <svg className={tw`w-4 h-4 sm:w-5 sm:h-5`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                </svg>
                                Enviar outra foto
                            </button>
                        )}
                    </div>
                </div>

                <div className={tw`bg-gray-50 p-3 sm:p-4 rounded-xl border-l-4 border-indigo-400 mt-4 sm:mt-6 transform transition-all duration-300`}>
                    <p className={tw`text-xs sm:text-sm text-gray-600 text-center flex items-center justify-center gap-1 sm:gap-2 px-2`}>
                        <svg className={tw`w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0`} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        <span className={tw`text-center`}>Sua foto será compartilhada com os organizadores do evento.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}