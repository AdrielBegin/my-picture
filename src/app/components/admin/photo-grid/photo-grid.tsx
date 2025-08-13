import { tw } from 'twind';
import { useState } from 'react';
import { Photo } from '@/types/photo';
import PhotoCard from '../photo-card/photo-card';
import PhotoExpandedModal from '../modal-expanded-photo/modal-expanded-photo';

type PhotoGridProps = {
  photos: Photo[];
  onPhotoDelete?: () => void;
};

export default function PhotoGrid({ photos, onPhotoDelete }: PhotoGridProps) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const handleOpenModal = (index: number) => {    
    setCurrentIndex(index);
  };

  const handleCloseModal = () => {    
    setCurrentIndex(null);  
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev !== null ? (prev - 1 + photos.length) % photos.length : prev
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev !== null ? (prev + 1) % photos.length : prev
    );
  };

  if (photos.length === 0) {
    return (
      <div className={tw`text-center py-12 text-gray-500`}>
        <div className={tw`text-6xl mb-4`}>📷</div>
        <h3 className={tw`text-xl font-semibold mb-2`}>Nenhuma foto encontrada</h3>
        <p>Tente ajustar os filtros ou adicione novas fotos ao evento.</p>
      </div>
    );
  }

  return (
    <>
      <div className={tw`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}>
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => {              
              handleOpenModal(index);
            }}
          />
        ))}
      </div>

      {/* Modal para exibir imagem expandida */}
      {currentIndex !== null && (
        <PhotoExpandedModal
          photos={photos}
          currentIndex={currentIndex}
          onClose={handleCloseModal}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </>
  );
}