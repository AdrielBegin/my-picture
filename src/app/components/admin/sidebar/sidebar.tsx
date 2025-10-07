'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FiLogOut } from 'react-icons/fi';
import { FaCalendarAlt } from "react-icons/fa";
import { GrGallery } from "react-icons/gr";
import Link from 'next/link';
import Image from 'next/image';
import { tw } from 'twind';

interface SidebarProps {
  className?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ className, collapsed, onToggleCollapse, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    // {
    //   id: 'dashboard',
    //   label: 'Dashboard',
    //   icon: <MdDashboardCustomize />,
    //   path: '/routes/dashboard',
    //   active: pathname === '/routes/dashboard'
    // },
    {
      id: 'events',
      label: 'Meus Eventos',
      icon: <FaCalendarAlt />,
      path: '/routes/meus-eventos',
      active: pathname === '/routes/meus-eventos'
    },
    {
      id: 'gallery',
      label: 'Galeria de Fotos',
      icon: <GrGallery />,
      path: '/routes/galeria-fotos',
      active: pathname === '/routes/galeria-fotos'
    }
  ];

  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTimeout, setNavigationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced navigation to prevent multiple rapid clicks
  const handleNavigation = useCallback((path: string) => {
    if (isNavigating || pathname === path) return;

    // Clear any existing timeout
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
    }

    setIsNavigating(true);

    // Add a small delay to prevent rapid navigation
    const timeout = setTimeout(() => {
      router.push(path);
      setNavigationTimeout(null);
    }, 150);

    setNavigationTimeout(timeout);
  }, [router, pathname, isNavigating, navigationTimeout]);

  // Reset navigation state when pathname changes
  useEffect(() => {
    setIsNavigating(false);
    if (navigationTimeout) {
      clearTimeout(navigationTimeout);
      setNavigationTimeout(null);
    }
  }, [pathname]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeout) {
        clearTimeout(navigationTimeout);
      }
    };
  }, [navigationTimeout]);

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
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className={tw`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden`}
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={tw`
        ${className} bg-white min-h-screen shadow-lg border-r border-gray-200 flex flex-col
        fixed lg:relative z-50
        transition-transform duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo/Header */}
        <div className={tw`p-6 border-b border-gray-200`}>
          <div className={tw`flex items-center space-x-3`}>
            <div className={tw`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white`}>
              <Image
                src="/favicon.ico"
                alt="Logo da Fouet Caramelo"
                width={40}
                height={40}
                className={tw`object-contain`}
                priority
              />
            </div>
            {!collapsed && (
              <div>
                <h1 className={tw`text-xl font-bold text-gray-800`}>Fouet Caramelo</h1>
              </div>
            )}
          </div>
        </div>

        {/* Menu Principal */}
        <div className={tw`flex-1 py-6`}>
          {!collapsed && (
            <div className={tw`px-4 mb-4`}>
              <h2 className={tw`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3`}>
                MENU PRINCIPAL
              </h2>
            </div>
          )}

          <nav className={tw`space-y-1 px-3`}>
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                prefetch={true}
                className={tw`
                w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200
                ${item.active
                    ? 'bg-[#40B1C4]/10 text-[#40B1C4] border-r-2 border-[#40B1C4]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                ${isNavigating ? 'opacity-70 pointer-events-none' : ''}
                block no-underline
              `}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.path);
                  onMobileClose?.();
                }}
              >
                <div className={tw`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                  <span className={tw`text-lg mr-3 flex items-center justify-center`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className={tw`font-medium`}>{item.label}</span>
                  )}
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Section */}
        <div className={tw`border-t border-gray-200 p-4`}>
          <div className={tw`flex items-center space-x-3 mb-4`}>
            <div className={tw`w-8 h-8 bg-[#40B1C4] rounded-full flex items-center justify-center`}>
              <span className={tw`text-white text-sm font-bold`}>A</span>
            </div>
            {!collapsed && (
              <div className={tw`flex-1`}>
                <p className={tw`text-sm font-medium text-gray-800`}>Admin</p>
                <p className={tw`text-xs text-gray-500`}>Gerenciar eventos</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={tw`
            w-full flex items-center px-3 py-2 text-left rounded-lg transition-all duration-200
            text-red-600 hover:bg-red-50
          `}
          >
            <span className={tw`text-lg mr-3 ${collapsed ? 'mx-auto' : ''}`}>
              <FiLogOut />
            </span>
            {!collapsed && (
              <span className={tw`font-medium`}>Sair</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}