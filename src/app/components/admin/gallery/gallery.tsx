import { useState } from 'react';
import { Photo } from '@/types/photo';
import PhotoCard from '../photo-card/photo-card';
import PhotoExpandedModal from '../modal-expanded-photo/modal-expanded-photo';

export default function Gallery({ photos }: { photos: Photo[] }) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const handleOpenModal = (index: number) => {
    console.log('Abrindo modal para índice:', index); // Debug
    setCurrentIndex(index);
  };

  const handleCloseModal = () => {
    console.log('Fechando modal'); // Debug
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => {
              console.log('PhotoCard clicado, índice:', index); // Debug
              handleOpenModal(index);
            }}
          />
        ))}
      </div>

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