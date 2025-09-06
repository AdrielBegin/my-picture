import { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { tw } from 'twind';
import Image from 'next/image';

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
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [zoom, setZoom] = useState(1);
  const [initialDistance, setInitialDistance] = useState(0);
  const [focusPoint, setFocusPoint] = useState<{x: number, y: number} | null>(null);
  const [isLandscape, setIsLandscape] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [imageQuality, setImageQuality] = useState<'HD' | 'FHD' | '4K'>('HD');

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCapturedImage(null);
    setError(null);
  };

  useEffect(() => {
    setIsVisible(true);
    startCamera();
    
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = deviceList.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
      } catch (err) {
        console.warn('Não foi possível enumerar dispositivos:', err);
      }
    };
    
    getDevices();
    
    // Detectar orientação da tela
    const handleOrientationChange = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    handleOrientationChange();
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Prevenir scroll/zoom da página
    const preventDefaultTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());
    
    return () => {
      stopCamera();
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('touchmove', preventDefaultTouch);
      document.removeEventListener('gesturestart', (e) => e.preventDefault());
      document.removeEventListener('gesturechange', (e) => e.preventDefault());
      document.removeEventListener('gestureend', (e) => e.preventDefault());
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setLoading(true);
      setError(null);
      setCapturedImage(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Seu navegador não suporta acesso à câmera");
      }

      // Para a stream anterior se existir e aguarda um pouco
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = mediaStream;

        await new Promise<void>((resolve, reject) => {
          const handleLoadedMetadata = async () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("error", handleError);

            try {
              await video.play();
              
              // Determinar qualidade baseada na resolução
              const width = video.videoWidth;
              const height = video.videoHeight;
              if (width >= 3840 || height >= 2160) {
                setImageQuality('4K');
              } else if (width >= 1920 || height >= 1080) {
                setImageQuality('FHD');
              } else {
                setImageQuality('HD');
              }
              
              resolve();
            } catch (err) {
              reject(err);
            }
          };

          const handleError = (e: Event) => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
            video.removeEventListener("error", handleError);
            reject(e);
          };

          video.addEventListener("loadedmetadata", handleLoadedMetadata);
          video.addEventListener("error", handleError);
        });

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
        console.warn('Stream foi interrompida, tentando novamente...');
        return;
      }
    }

    setError(errorMessage);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    // Vibração háptica para feedback tátil
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Vibração curta de 50ms
    }
    
    // Efeito de flash
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      setError('Aguarde a câmera carregar completamente');
      setIsCapturing(false);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      setError('Erro ao processar a foto');
      setIsCapturing(false);
      return;
    }

    if (facingMode === 'user') {
      context.scale(-1, 1);
      context.translate(-canvas.width, 0);
    }

    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageDataUrl);

    setTimeout(() => setIsCapturing(false), 200);
  };

  const confirmPhoto = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoCount(prev => prev + 1);
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
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    startCamera();
  };

  const switchCamera = async () => {
    if (isChangingCamera || loading) return;

    setIsChangingCamera(true);
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Aguarda a animação antes de fechar
    setTimeout(() => {
      stopCamera();
      onClose?.();
    }, 300);
   }, [onClose]);

   // Função para calcular distância entre dois toques
   const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
     return Math.sqrt(
       Math.pow(touch2.clientX - touch1.clientX, 2) +
       Math.pow(touch2.clientY - touch1.clientY, 2)
     );
   };

   // Gestos touch
   const handleVideoTouchStart = useCallback((e: React.TouchEvent) => {
     if (e.touches.length === 2) {
       // Pinch gesture iniciado
       const distance = getDistance(e.touches[0], e.touches[1]);
       setInitialDistance(distance);
     }
   }, []);

   const handleVideoTouchMove = useCallback((e: React.TouchEvent) => {
     if (e.touches.length === 2 && initialDistance > 0) {
       // Pinch to zoom
       e.preventDefault();
       const currentDistance = getDistance(e.touches[0], e.touches[1]);
       const scale = currentDistance / initialDistance;
       const newZoom = Math.min(Math.max(zoom * scale, 1), 3); // Limita zoom entre 1x e 3x
       setZoom(newZoom);
       setInitialDistance(currentDistance);
     }
   }, [initialDistance, zoom]);

   const handleVideoTouch = useCallback((e: React.TouchEvent) => {
     if (e.touches.length > 1) return; // Ignora se há múltiplos toques
     
     const currentTime = new Date().getTime();
     const tapLength = currentTime - lastTap;
     
     // Mostrar indicador de foco
     const rect = e.currentTarget.getBoundingClientRect();
     const touch = e.touches[0] || e.changedTouches[0];
     const x = ((touch.clientX - rect.left) / rect.width) * 100;
     const y = ((touch.clientY - rect.top) / rect.height) * 100;
     
     setFocusPoint({ x, y });
     setTimeout(() => setFocusPoint(null), 1000);
     
     if (tapLength < 500 && tapLength > 0) {
       // Double tap - alternar câmera
       if (devices.length > 1 && !isChangingCamera) {
         switchCamera();
       }
     } else {
       // Single tap - capturar foto (após delay)
       setTimeout(() => {
         if (new Date().getTime() - currentTime > 400) {
           if (!isCapturing && !loading && !capturedImage) {
             takePhoto();
           }
         }
       }, 400);
     }
     
     setLastTap(currentTime);
   }, [lastTap, devices.length, isChangingCamera, isCapturing, loading, capturedImage, switchCamera, takePhoto]);

  if (error) {
    return createPortal(
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
      </div>,
      document.body
    );
  }

  return createPortal(
      <div className={tw`fixed inset-0 bg-black z-50 transition-all duration-300 ${isVisible && !isClosing ? 'bg-opacity-95' : 'bg-opacity-0'} ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Flash Effect */}
        {showFlash && (
          <div className={tw`absolute inset-0 bg-white z-50 animate-pulse`} style={{animationDuration: '200ms'}}></div>
        )}
      <div className={tw`relative w-full h-full transition-transform duration-300 ${isVisible && !isClosing ? 'scale-100' : 'scale-95'}`}>
          {/* Header */}
        <div className={tw`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-white absolute ${isLandscape ? 'top-2 left-2 right-auto' : 'top-0 left-0 right-0'} z-10 transition-all duration-300 ${isVisible && !isClosing ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
        {!isLandscape && <h2 className={tw`text-lg sm:text-xl font-semibold`}>Tirar Foto</h2>}
        <button
          onClick={handleClose}
          className={tw`p-2 sm:p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-all duration-200 hover:scale-110 active:scale-95 ${isLandscape ? 'ml-0' : ''}`}
        >
          <X size={24} className={tw`sm:w-7 sm:h-7`} />
        </button>
      </div>

        {/* Área da câmera/preview */}
        <div className={tw`absolute inset-0 overflow-hidden transition-all duration-300 ${isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}>
          {loading && (
            <div className={tw`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white z-10`}>
              <div className={tw`text-center animate-pulse`}>
                <div className={tw`relative mb-6`}>
                  <div className={tw`animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-blue-500 border-r-purple-500 mx-auto`}></div>
                  <div className={tw`absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-blue-400 opacity-20 mx-auto`}></div>
                </div>
                <p className={tw`text-lg font-medium mb-2`}>{isChangingCamera ? 'Alternando câmera...' : 'Iniciando câmera...'}</p>
                <p className={tw`text-sm text-gray-300 animate-bounce`}>Aguarde um momento</p>
              </div>
            </div>
          )}

          {capturedImage ? (
            <div className={tw`relative w-full h-full flex items-center justify-center bg-black animate-in fade-in duration-300`}>
              <div className={tw`relative flex items-center justify-center w-full h-full`}>
                <div className={tw`relative max-w-full max-h-full flex items-center justify-center`}>
                  <Image
                    src={capturedImage}
                    alt="Foto Capturada"
                    width={500}
                    height={500}
                    className={tw`max-w-full max-h-full object-contain rounded-lg`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto'
                    }}
                  />
                </div>
                {/* Preview Overlay */}
                <div className={tw`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none rounded-lg`}></div>                
                
              </div>
            </div>
          ) : (
            <div className={tw`absolute inset-0`}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onTouchStart={handleVideoTouchStart}
                onTouchMove={handleVideoTouchMove}
                onTouchEnd={handleVideoTouch}
                className={tw`absolute inset-0 w-full h-full object-cover cursor-pointer`}
                style={{
                  transform: `${facingMode === 'user' ? 'transform scale-x-[-1]' : 'transform scale-x[1]'} scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
              />

              {(isCapturing || showFlash) && (
                <div className={tw`absolute inset-0 bg-white ${showFlash ? 'opacity-90' : 'opacity-70'} ${showFlash ? 'animate-none' : 'animate-pulse'}`}></div>
              )}

              <div className={tw`absolute inset-0 pointer-events-none`}>
                <div className={tw`w-full h-full border-2 border-white border-opacity-30 relative`}>
                  <div className={tw`absolute top-1/3 left-0 w-full border-t border-white border-opacity-30`}></div>
                  <div className={tw`absolute top-2/3 left-0 w-full border-t border-white border-opacity-30`}></div>
                  <div className={tw`absolute left-1/3 top-0 h-full border-l border-white border-opacity-30`}></div>
                  <div className={tw`absolute left-2/3 top-0 h-full border-l border-white border-opacity-30`}></div>
                </div>
                
                {/* Indicadores superiores */}
                <div className={tw`absolute top-4 right-4 flex flex-col gap-2`}>
                  {/* Indicador de Zoom */}
                  {zoom > 1 && (
                    <div className={tw`bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-medium`}>
                      {zoom.toFixed(1)}x
                    </div>
                  )}
                  
                  {/* Indicador de Qualidade */}
                  <div className={tw`bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-medium`}>
                    {imageQuality}
                  </div>
                  
                  {/* Contador de Fotos */}
                  {photoCount > 0 && (
                    <div className={tw`bg-blue-600/80 backdrop-blur-sm text-white px-3 py-2 rounded-full text-xs font-medium`}>
                      📸 {photoCount}
                    </div>
                  )}
                </div>
                
                {/* Indicador de Foco */}
                {focusPoint && (
                  <div 
                    className={tw`absolute w-16 h-16 border-2 border-white rounded-full animate-ping pointer-events-none`}
                    style={{
                      left: `${focusPoint.x}%`,
                      top: `${focusPoint.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className={tw`absolute inset-2 border-2 border-white rounded-full`}></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className={tw`px-4 sm:px-6 py-6 sm:py-8 absolute ${isLandscape ? 'right-0 top-0 bottom-0 w-24 flex-col justify-center' : 'bottom-0 left-0 right-0'} z-10 transition-all duration-300 ${isVisible && !isClosing ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          {capturedImage ? (
            <div className={tw`flex ${isLandscape ? 'flex-col gap-4' : 'flex-col sm:flex-row'} items-center justify-center ${isLandscape ? '' : 'sm:justify-between'} gap-3 sm:gap-4`}>
              <button
                onClick={retakePhoto}
                className={tw`flex items-center ${isLandscape ? 'justify-center w-16 h-16' : 'gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4'} bg-gray-700/80 backdrop-blur-sm text-white rounded-xl sm:rounded-2xl hover:bg-gray-600/80 transition-all duration-200 hover:scale-105 active:scale-95 font-medium text-sm sm:text-base ${isLandscape ? '' : 'w-full sm:w-auto'}`}
              >
                <RotateCcw size={20} className={tw`sm:w-6 sm:h-6`} />
                {!isLandscape && 'Tirar Novamente'}
              </button>

              <button
                onClick={confirmPhoto}
                className={tw`flex items-center ${isLandscape ? 'justify-center w-16 h-16' : 'gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4'} bg-blue-600/90 backdrop-blur-sm text-white rounded-xl sm:rounded-2xl hover:bg-blue-500/90 transition-all duration-200 hover:scale-105 active:scale-95 font-medium shadow-lg text-sm sm:text-base ${isLandscape ? '' : 'w-full sm:w-auto'}`}
              >
                <Check size={20} className={tw`sm:w-6 sm:h-6`} />
                {!isLandscape && 'Confirmar'}
              </button>
            </div>
          ) : (
            <div className={tw`flex ${isLandscape ? 'flex-col gap-6' : 'items-center justify-center gap-6 sm:gap-8'}`}>
              <button
                onClick={switchCamera}
                disabled={loading || isChangingCamera}
                className={tw`p-4 sm:p-5 bg-gray-700/80 backdrop-blur-sm text-white rounded-full hover:bg-gray-600/80 transition-all duration-200 disabled:opacity-50 hover:scale-110 active:scale-95 shadow-lg min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px]`}
              >
                <RotateCcw size={24} className={tw`sm:w-7 sm:h-7 ${isChangingCamera ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={takePhoto}
                disabled={loading || !stream || isChangingCamera}
                className={tw`${isLandscape ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'} bg-white rounded-full border-4 border-gray-300 hover:border-blue-400 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed text-black shadow-2xl hover:scale-110 active:scale-95 flex items-center justify-center`}
              >
                <Camera size={isLandscape ? 24 : 32} className={tw`${isLandscape ? 'w-6 h-6' : 'sm:w-10 sm:h-10'}`} />
              </button>

              {/* Botão de reset do zoom */}
              {zoom > 1 && (
                <button
                  onClick={() => setZoom(1)}
                  className={tw`p-4 sm:p-5 bg-blue-600/80 backdrop-blur-sm text-white rounded-full hover:bg-blue-500/80 transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg min-w-[56px] min-h-[56px] sm:min-w-[64px] sm:min-h-[64px] text-xs sm:text-sm font-medium`}
                >
                  1x
                </button>
              )}
              
              {zoom <= 1 && !isLandscape && (
                <div className={tw`w-14 h-14 sm:w-16 sm:h-16`}></div>
              )}
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>,
    document.body
  );
}