'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '🏠',
      path: '/routes/dashboard',
      active: pathname === '/routes/dashboard'
    },
    {
      id: 'events',
      label: 'Meus Eventos',
      icon: '📅',
      path: '/routes/meus-eventos',
      active: pathname === '/routes/meus-eventos'
    },
    {
      id: 'gallery',
      label: 'Galeria de Fotos',
      icon: '🖼️',
      path: '/routes/galeria-fotos',
      active: pathname === '/routes/galeria-fotos'
    }
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

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
          <div className={tw`w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center`}>
            <span className={tw`text-white text-lg font-bold`}>📸</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className={tw`text-xl font-bold text-gray-800`}>My pictures App</h1>
              <p className={tw`text-sm text-gray-500`}>Fotos de Eventos via QR</p>
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
            <button
              key={item.id}
              onClick={() => {
                handleNavigation(item.path);
                onMobileClose?.();
              }}
              className={tw`
                w-full flex items-center px-3 py-3 text-left rounded-lg transition-all duration-200
                ${item.active 
                  ? 'bg-purple-50 text-purple-700 border-r-2 border-purple-500' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className={tw`text-lg mr-3 ${collapsed ? 'mx-auto' : ''}`}>{item.icon}</span>
              {!collapsed && (
                <span className={tw`font-medium`}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* User Section */}
      <div className={tw`border-t border-gray-200 p-4`}>
        <div className={tw`flex items-center space-x-3 mb-4`}>
          <div className={tw`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center`}>
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
          <span className={tw`text-lg mr-3 ${collapsed ? 'mx-auto' : ''}`}>🚪</span>
          {!collapsed && (
            <span className={tw`font-medium`}>Sair</span>
          )}
        </button>
      </div>
    </div>
    </>
  );
}