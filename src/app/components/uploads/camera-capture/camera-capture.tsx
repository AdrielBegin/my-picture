// src/app/components/uploads/camera-capture/camera-capture.tsx
import { useRef, useState, useEffect } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { tw } from 'twind';

type CameraCaptureProps = {
  onCapture: (file: File) => void;
  onClose?: () => void;
};

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isChangingCamera, setIsChangingCamera] = useState(false);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    // Limpa o srcObject do vídeo
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCapturedImage(null);
    setError(null);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setLoading(true);
      setError(null);
      setCapturedImage(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera');
      }

      // Para a stream anterior se existir e aguarda um pouco
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        // Pequena pausa para garantir que a stream anterior seja liberada
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Limpa o video antes de definir nova stream
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        // Aguarda o video ser limpo
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Aguarda o video estar pronto antes de tentar reproduzir
        await new Promise((resolve, reject) => {
          const video = videoRef.current!;
          
          const handleLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            resolve(void 0);
          };
          
          const handleError = (e: Event) => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            reject(e);
          };
          
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('error', handleError);
        });

        // Agora tenta reproduzir o vídeo
        try {
          await videoRef.current.play();
        } catch (playError) {
          console.warn('Erro ao reproduzir vídeo:', playError);
          // Se falhar, tenta novamente após um breve delay
          await new Promise(resolve => setTimeout(resolve, 100));
          await videoRef.current.play();
        }
        
        setStream(mediaStream);
      }
    } catch (error) {
      handleCameraError(error);
    } finally {
      setLoading(false);
      setIsChangingCamera(false);
    }
  };

  const handleCameraError = (error: unknown) => {
    console.error('Erro de câmera capturado:', error);
    let errorMessage = 'Erro desconhecido ao acessar a câmera';

    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
        errorMessage = 'Acesso à câmera negado. Por favor, permita o acesso e recarregue a página.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Acesso à câmera não é suportado neste navegador.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Configuração da câmera não suportada.';
      } else if (error.name === 'AbortError') {
        // Erro comum quando há interrupção, geralmente não é crítico
        console.warn('Stream foi interrompida, tentando novamente...');
        return; // Não define erro para o usuário
      }
    }

    setError(errorMessage);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Verifica se o vídeo está pronto
    if (video.readyState < 2) {
      setError('Aguarde a câmera carregar completamente');
      setIsCapturing(false);
      return;
    }

    // Configura o canvas com as dimensões do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      setError('Erro ao processar a foto');
      setIsCapturing(false);
      return;
    }

    // Desenha o frame atual do vídeo no canvas
    context.drawImage(video, 0, 0);

    // Converte para imagem
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);

    // Simula um flash da câmera
    setTimeout(() => setIsCapturing(false), 200);
  };

  const confirmPhoto = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
        handleClose();
      } else {
        setError('Erro ao salvar a foto');
      }
    }, 'image/jpeg', 0.9);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
  };

  const switchCamera = async () => {
    if (isChangingCamera || loading) return;
    
    setIsChangingCamera(true);
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = () => {
    stopCamera();
    onClose?.();
  };

  if (error) {
    return (
      <div className={tw`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50`}>
        <div className={tw`bg-white rounded-lg p-6 m-4 max-w-md w-full`}>
          <div className={tw`flex items-center justify-between mb-4`}>
            <h2 className={tw`text-lg font-semibold text-gray-800`}>Erro na Câmera</h2>
            <button
              onClick={handleClose}
              className={tw`text-gray-500 hover:text-gray-700 transition-colors`}
            >
              <X size={24} />
            </button>
          </div>

          <div className={tw`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4`}>
            <p className={tw`text-sm`}>{error}</p>
          </div>

          <div className={tw`flex gap-2`}>
            <button
              onClick={startCamera}
              className={tw`flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors`}
            >
              Tentar Novamente
            </button>
            <button
              onClick={handleClose}
              className={tw`bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors`}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={tw`fullscreen-overlay inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50`}>
      <div className={tw`relative w-full h-full max-w-lg max-h-full flex flex-col`}>
        {/* Header */}
        <div className={tw`flex items-center justify-between p-4 text-white`}>
          <h2 className={tw`text-lg font-semibold`}>Tirar Foto</h2>
          <button
            onClick={handleClose}
            className={tw`text-white hover:text-gray-300 transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Área da câmera/preview */}
        <div className={tw`flex-1 relative overflow-hidden`}>
          {loading && (
            <div className={tw`absolute inset-0 flex items-center justify-center bg-gray-900 text-white z-10`}>
              <div className={tw`text-center`}>
                <div className={tw`animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2`}></div>
                <p>{isChangingCamera ? 'Alternando câmera...' : 'Carregando câmera...'}</p>
              </div>
            </div>
          )}

          {capturedImage ? (
            // Preview da foto capturada
            <div className={tw`relative w-full h-full flex items-center justify-center bg-black`}>
              <img
                src={capturedImage}
                alt="Foto capturada"
                className={tw`max-w-full max-h-full object-contain`}
              />
            </div>
          ) : (
            // Stream da câmera
            <div className={tw`relative w-full h-full`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={tw`w-full h-full object-cover`}
              />

              {/* Flash effect */}
              {isCapturing && (
                <div className={tw`absolute inset-0 bg-white opacity-70 animate-pulse`}></div>
              )}

              {/* Grid de enquadramento */}
              <div className={tw`absolute inset-0 pointer-events-none`}>
                <div className={tw`w-full h-full border-2 border-white border-opacity-30 relative`}>
                  <div className={tw`absolute top-1/3 left-0 w-full border-t border-white border-opacity-30`}></div>
                  <div className={tw`absolute top-2/3 left-0 w-full border-t border-white border-opacity-30`}></div>
                  <div className={tw`absolute left-1/3 top-0 h-full border-l border-white border-opacity-30`}></div>
                  <div className={tw`absolute left-2/3 top-0 h-full border-l border-white border-opacity-30`}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="p-6">
          {capturedImage ? (
            // Controles para foto capturada
            <div className={tw`flex items-center justify-between`}>
              <button
                onClick={retakePhoto}
                className={tw`flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-full font-medium transition-colors`}
              >
                <RotateCcw size={20} />
                Repetir
              </button>

              <button
                onClick={confirmPhoto}
                className={tw`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-full font-medium transition-colors`}
              >
                <Check size={20} />
                Usar Foto
              </button>
            </div>
          ) : (
            // Controles da câmera
            <div className={tw`flex items-center justify-between`}>
              {/* Botão para alternar câmera */}
              <button
                onClick={switchCamera}
                disabled={loading || isChangingCamera}
                className={tw`bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white p-3 rounded-full transition-colors`}
              >
                <RotateCcw size={20} className={isChangingCamera ? 'animate-spin' : ''} />
              </button>

              {/* Botão principal de captura */}
              <button
                onClick={takePhoto}
                disabled={loading || !stream || isChangingCamera}
                className={tw`bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-black p-4 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95`}
              >
                <Camera size={28} />
              </button>

              {/* Espaço reservado para manter simetria */}
              <div className={tw`w-12 h-12`}></div>
            </div>
          )}
        </div>

        {/* Canvas oculto para processamento */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}