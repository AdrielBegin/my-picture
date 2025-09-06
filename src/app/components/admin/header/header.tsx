'use client';
import { useRouter, usePathname } from 'next/navigation';
import { tw } from 'twind';

interface HeaderProps {
  title: string;
  subtitle: string;
  onNewEvent?: () => void;
}

export default function Header({ title, subtitle, onNewEvent }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleNewEvent = () => {
    if (onNewEvent) {
      onNewEvent();
    } else {
      // Se não estiver na página Meus Eventos, navegar para lá primeiro
      if (pathname !== '/routes/meus-eventos') {
        router.push('/routes/meus-eventos');
        // Aguardar um pouco para a página carregar e então abrir o modal
        setTimeout(() => {
          const event = new CustomEvent('openCadastroModal');
          window.dispatchEvent(event);
        }, 100);
      } else {
        // Se já estiver na página, apenas abrir o modal
        const event = new CustomEvent('openCadastroModal');
        window.dispatchEvent(event);
      }
    }
  };

  return (
    <div className={tw`bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6 mt-12 lg:mt-0`}>
      <div className={tw`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4`}>
        <div className={tw`flex-1`}>
          <h1 className={tw`text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2`}>{title}</h1>
          <p className={tw`text-gray-600 text-xs sm:text-base lg:text-lg`}>{subtitle}</p>
        </div>
        
        <div className={tw`flex items-center gap-2 sm:gap-3 flex-shrink-0`}>
          <button
            onClick={handleNewEvent}
            className={tw`
              bg-gradient-to-r from-purple-600 to-blue-600 text-white
              px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg font-semibold
              hover:from-purple-700 hover:to-blue-700
              transition-all duration-200
              flex items-center gap-1.5 sm:gap-2
              shadow-lg hover:shadow-xl
              transform hover:scale-105
              text-sm sm:text-base
              w-full sm:w-auto justify-center
            `}
          >
            <svg className={tw`w-4 h-4 sm:w-5 sm:h-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className={tw`hidden xs:inline sm:inline`}>Novo Evento</span>
            <span className={tw`xs:hidden sm:hidden`}>+</span>
          </button>
        </div>
      </div>
    </div>
  );
}