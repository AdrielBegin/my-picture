// Filters.tsx
import { tw } from 'twind';
import { use, useEffect, useState } from 'react';
import { Event } from '@/types/event';
import { Timestamp } from 'firebase/firestore';

type FiltersProps = {
  events: Event[];
  onFilter: (eventId: string | null) => void;
};

export default function Filters({ events, onFilter }: FiltersProps) {
  const [search, setSearch] = useState('');  

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === '') {
      onFilter(null);
      return;
    }

    const normalizedSearch = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const matchedEvent = events.find(event => {
      const name = event.eventName || '';
      return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .includes(normalizedSearch);
    });

    if (matchedEvent) {
      onFilter(matchedEvent?.eventId ?? null);
    } else {
      onFilter(null);
    }
  };

  return (
    <div className={tw`mb-6 bg-white p-4 rounded-lg shadow-sm`}>
      <div className={tw`flex flex-col sm:flex-row gap-4`}>
        <input
          type="text"
          placeholder="Filtrar por nome do evento"
          value={search}
          onChange={handleSearch}
          className={tw`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500`}
        />
        {/* <select className={tw`p-2 border rounded-lg`}>
          <option>Ordenar por data</option>
          <option>Mais recentes</option>
          <option>Mais antigas</option>
        </select> */}
      </div>
    </div>
  );
}
