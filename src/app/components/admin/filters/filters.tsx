// Filters.tsx
import { tw } from 'twind';
import { useEffect, useState, useCallback } from 'react';
import { Event } from '@/types/event';

type FiltersProps = {
  events: Event[];
  onFilter: (eventId: string | null) => void;
};

export default function Filters({ events, onFilter }: FiltersProps) {
  const [search, setSearch] = useState('');
  const [hasResults, setHasResults] = useState(true);

  // Debounce para melhorar performance
  const debounceSearch = useCallback(
    (searchTerm: string) => {
      const timeoutId = setTimeout(() => {
        performSearch(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    },
    [events]
  );

  const performSearch = (searchTerm: string) => {
    // Se o campo estiver vazio, remove o filtro
    if (searchTerm.trim() === '') {
      onFilter(null);
      setHasResults(true);
      return;
    }

    // Normaliza o texto de busca (remove acentos e converte para minúsculo)
    const normalizedSearch = searchTerm
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    // Busca por eventos que contenham o texto
    const matchedEvents = events.filter(event => {
      if (!event.eventName) return false;
      
      const normalizedEventName = event.eventName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      return normalizedEventName.includes(normalizedSearch);
    });

    // Atualiza o estado dos resultados
    setHasResults(matchedEvents.length > 0);

    // Se encontrou eventos, filtra pelo primeiro
    // Se não encontrou nenhum, limpa o filtro
    if (matchedEvents.length > 0) {
      onFilter(matchedEvents[0].eventId);
    } else {
      onFilter(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
  };

  // Implementa o debounce quando o search muda
  useEffect(() => {
    const cleanup = debounceSearch(search);
    return cleanup;
  }, [search, debounceSearch]);

  const handleClearFilter = () => {
    setSearch('');
    setHasResults(true);
    onFilter(null);
  };

  return (
    <div className={tw`space-y-4`}>
      <div className={tw`flex items-center gap-3 mb-4`}>
        <div className={tw`w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center`}>
          <span className={tw`text-white text-sm`}>🔍</span>
        </div>
        <h2 className={tw`text-xl font-semibold text-gray-800`}>Filtros</h2>
      </div>
      
      <div className={tw`flex flex-col sm:flex-row gap-4`}>
        <div className={tw`flex-1 relative`}>
          <div className={tw`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none`}>
            <svg className={tw`w-5 h-5 text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Filtrar por nome do evento..."
            value={search}
            onChange={handleSearch}
            className={tw`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400`}
          />
        </div>
        
        <button
          onClick={handleClearFilter}
          className={tw`px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium flex items-center gap-2`}
        >
          <svg className={tw`w-4 h-4`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpar
        </button>
      </div>
      
      {search && (
        <div className={tw`text-sm px-4 py-2 rounded-lg border ${
          hasResults 
            ? 'text-gray-600 bg-blue-50 border-blue-200' 
            : 'text-red-600 bg-red-50 border-red-200'
        }`}>
          {hasResults ? (
            <>
              <span className={tw`font-medium`}>Filtro ativo:</span> &quot;{search}&quot;
            </>
          ) : (
            <>
              <span className={tw`font-medium`}>Nenhum evento encontrado para:</span> &quot;{search}&quot;
            </>
          )}
        </div>
      )}
    </div>
  );
}
