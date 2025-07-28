import { tw } from 'twind';
import { Photo } from '@/types/photo';

type StatsProps = {
  photos: Photo[];
};

export default function Stats({ photos }: StatsProps) {
    
  const formatDate = (timestamp?: Date) => {
    return timestamp ? new Date(timestamp).toLocaleString() : 'N/A';
  };
  
  const getTopSender = () => {
    if (photos.length === 0) return 'N/A';

    const emailCounts: Record<string, number> = {};

    photos.forEach(photo => {
      if (photo.userName) {
        emailCounts[photo.userName] = (emailCounts[photo.userName] || 0) + 1;
      }
    });

    const sortedEmails = Object.entries(emailCounts).sort((a, b) => b[1] - a[1]);
    return sortedEmails.length > 0 ? sortedEmails[0][0] : 'N/A';
  };

  return (
    <div className={tw`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6`}>
      <div className={tw`bg-indigo-100 p-4 rounded-lg`}>
        <h3 className={tw`text-indigo-800 font-medium`}>Total de Fotos</h3>
        <p className={tw`text-2xl font-bold text-indigo-600`}>{photos.length}</p>
      </div>
      <div className={tw`bg-green-100 p-4 rounded-lg`}>
        <h3 className={tw`text-green-800 font-medium`}>Última Foto</h3>
        <p className={tw`text-lg text-green-600`}>
          {photos.length > 0 
            ? formatDate(photos[0].createdAt?.toDate())
            : 'N/A'}
        </p>
      </div>
      <div className={tw`bg-amber-100 p-4 rounded-lg`}>
        <h3 className={tw`text-amber-800 font-medium`}>Top Enviador</h3>
        <p className={tw`text-lg text-amber-600`}>
          {getTopSender()}
        </p>
      </div>
    </div>
  );
}