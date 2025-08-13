'use client';

import { useRouter } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';
import { tw } from 'twind';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/routes/login');
      } else {
        alert('Erro ao sair, tente novamente.');
      }
    } catch {
      alert('Erro ao sair, tente novamente.');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={tw`
        flex items-center gap-2
        bg-red-600 hover:bg-red-700
        text-white font-semibold py-2 px-4 rounded
        transition-colors duration-200
      `}
      type="button"
      aria-label="Logout"
    >
      <FiLogOut size={20} />
      Logout
    </button>
  );
}
