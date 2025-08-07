'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CameraCapture from '../camera-capture/camera-capture';
import FileUpload from '../file-upload/file-upload';
import UploadStatus from '../upload-status/upload-status';
import { tw } from 'twind';
import { toast } from 'react-toastify';

export default function SendPicture() {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');
    const [userName, setUserName] = useState('');
    const eventName = searchParams.get('eventName') || 'Evento Desconhecido';
    const [showCamera, setShowCamera] = useState(false);

    const handleUpload = async (file: File) => {
        try {
            const formData = new FormData();

            if (userName) {
                formData.append('userName', userName);
            } else if (!userName) {
                toast.warn('Por favor, insira seu nome antes de enviar a foto.');
                return;
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

    return (
        <div className={tw`min-h-screen bg-gray-100 flex items-center py-12 px-4`}>
            <div className={tw`max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6`}>
                <div className={tw`space-y-4`}>
                    <div className={tw`text-2xl font-bold text-center text-green-500 mb-6`}>
                        <h1>{eventName}</h1>
                    </div>
                    <h1 className={tw`text-2xl font-bold text-center text-indigo-600 mb-6`}>
                        📸 Envie sua foto da festa!
                    </h1>
                    <label htmlFor="nome" className={tw`block font-medium text-gray-700 mb-1`}>Nome
                        <span className={tw`text-red-500`}>*</span>
                    </label>
                    <input
                        type="text"
                        id="nome"
                        name="nome"
                        placeholder="Ex: Maria da Silva"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className={tw`mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                </div>

                <div className={tw`space-y-6`}>
                    <button
                        onClick={() => setShowCamera(true)}
                        disabled={!userName}
                        className={tw`w-full py-2 px-4 rounded mt-4 text-white ${userName ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        Ligar câmera
                    </button>
                    {showCamera && (
                        <CameraCapture
                            onCapture={handleUpload}
                            onClose={() => setShowCamera(false)}
                        />
                    )}
                    <FileUpload onUpload={handleUpload} />
                    <UploadStatus status={uploadStatus} />
                </div>
            </div>
        </div>
    );
}