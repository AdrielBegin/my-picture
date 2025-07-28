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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      alert('Erro ao acessar a câmera: ' + (error as Error).message);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'photo.png', { type: 'image/png' });
        onCapture(file);
        setPhotoTaken(true);
      }
    }, 'image/png');
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
    setPhotoTaken(false);
  };

  return (
    <div className={tw`space-y-4`}>
      <h2 className={tw`text-lg font-semibold text-gray-700`}>Tirar foto</h2>
      
      {stream ? (
        <div className={tw`space-y-2`}>
          <video ref={videoRef} autoPlay playsInline className={tw`w-full rounded-lg`} />
          <div className={tw`flex gap-2`}>
            <button
              onClick={takePhoto}
              className={tw`flex-1 bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600`}
            >
              {photoTaken ? 'Foto capturada!' : 'Capturar foto'}
            </button>
            <button
              onClick={stopCamera}
              className={tw`bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600`}
            >
              Parar câmera
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startCamera}
          className={tw`w-full bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600`}
        >
          Ligar câmera
        </button>
      )}
    </div>
  );
}