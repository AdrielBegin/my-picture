'use client';
import { useRef, useState } from 'react';
import { tw } from 'twind';

type CameraCaptureProps = {
  onCapture: (file: File) => void;
};

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verifica se o navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Prefere câmera traseira em dispositivos móveis
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(`Erro ao acessar a câmera: ${errorMessage}`);
      
      // Diferentes tipos de erro
      if (errorMessage.includes('Permission denied') || errorMessage.includes('NotAllowedError')) {
        setError('Acesso à câmera negado. Por favor, permita o acesso e tente novamente.');
      } else if (errorMessage.includes('NotFoundError') || errorMessage.includes('DevicesNotFoundError')) {
        setError('Nenhuma câmera encontrada no dispositivo.');
      } else if (errorMessage.includes('NotSupportedError')) {
        setError('Acesso à câmera não é suportado neste navegador.');
      }
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) {
      setError('Erro ao processar a foto');
      return;
    }
    
    context.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.png`, { type: 'image/png' });
        onCapture(file);
        setPhotoTaken(true);
        // Auto-parar a câmera após capturar
        setTimeout(() => {
          stopCamera();
        }, 1000);
      } else {
        setError('Erro ao capturar a foto');
      }
    }, 'image/png', 0.9); // Qualidade 90%
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setPhotoTaken(false);
      setError(null);
    }
  };

  return (
    <div className={tw`space-y-4`}>
      <h2 className={tw`text-lg font-semibold text-gray-700`}>📷 Tirar foto</h2>
      
      {error && (
        <div className={tw`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative`}>
          <strong className={tw`font-bold`}>Erro: </strong>
          <span className={tw`block sm:inline`}>{error}</span>
        </div>
      )}
      
      {stream ? (
        <div className={tw`space-y-2`}>
          <div className={tw`relative`}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={tw`w-full rounded-lg shadow-md`} 
            />
            {photoTaken && (
              <div className={tw`absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center`}>
                <span className={tw`text-white text-lg font-bold bg-green-500 px-4 py-2 rounded`}>
                  ✓ Foto capturada!
                </span>
              </div>
            )}
          </div>
          <div className={tw`flex gap-2`}>
            <button
              onClick={takePhoto}
              disabled={photoTaken}
              className={tw`flex-1 ${
                photoTaken 
                  ? 'bg-green-500 cursor-not-allowed' 
                  : 'bg-indigo-500 hover:bg-indigo-600'
              } text-white py-3 px-4 rounded-lg font-medium transition-colors`}
            >
              {photoTaken ? '✓ Foto enviada!' : '📸 Capturar foto'}
            </button>
            <button
              onClick={stopCamera}
              className={tw`bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 font-medium transition-colors`}
            >
              ⏹️ Parar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startCamera}
          disabled={loading}
          className={tw`w-full ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          } text-white py-3 px-4 rounded-lg font-medium transition-colors`}
        >
          {loading ? '⏳ Ligando câmera...' : '📹 Ligar câmera'}
        </button>
      )}
    </div>
  );
}