import { tw } from 'twind';
import { Photo } from '@/types/photo';
import PhotoCard from '../photo-card/photo-card';

type PhotoGridProps = {
  photos: Photo[];
};

export default function PhotoGrid({ photos }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className={tw`text-center py-12 text-gray-500`}>
        Nenhuma foto encontrada com esses filtros.
      </div>
    );
  }

  return (
    <div className={tw`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`}>
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}