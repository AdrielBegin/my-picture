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
    <div className={tw`grid grid-cols-1 md:grid-cols-3 gap-6`}>
      <div className={tw`bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow`}>
        <div className={tw`flex items-center justify-between mb-3`}>
          <h3 className={tw`text-blue-800 font-semibold text-lg`}>Total de Fotos</h3>
          <div className={tw`w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center`}>
            <span className={tw`text-white text-lg`}>📸</span>
          </div>
        </div>
        <p className={tw`text-3xl font-bold text-blue-700`}>{photos.length}</p>
        <p className={tw`text-blue-600 text-sm mt-1`}>fotos enviadas</p>
      </div>
      
      <div className={tw`bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow`}>
        <div className={tw`flex items-center justify-between mb-3`}>
          <h3 className={tw`text-green-800 font-semibold text-lg`}>Última Foto</h3>
          <div className={tw`w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center`}>
            <span className={tw`text-white text-lg`}>🕒</span>
          </div>
        </div>
        <p className={tw`text-lg font-semibold text-green-700`}>
          {photos.length > 0 
            ? formatDate(photos[0].createdAt?.toDate())
            : 'Nenhuma foto'}
        </p>
        <p className={tw`text-green-600 text-sm mt-1`}>último envio</p>
      </div>
      
      <div className={tw`bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow`}>
        <div className={tw`flex items-center justify-between mb-3`}>
          <h3 className={tw`text-amber-800 font-semibold text-lg`}>Top Enviador</h3>
          <div className={tw`w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center`}>
            <span className={tw`text-white text-lg`}>👑</span>
          </div>
        </div>
        <p className={tw`text-lg font-semibold text-amber-700 truncate`}>
          {getTopSender()}
        </p>
        <p className={tw`text-amber-600 text-sm mt-1`}>mais ativo</p>
      </div>
    </div>
  );
}