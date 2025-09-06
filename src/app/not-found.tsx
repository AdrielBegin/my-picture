'use client';
import React from 'react';
import Link from 'next/link';
import { tw } from 'twind';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className={tw`min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4`}>
      <div className={tw`max-w-lg mx-auto text-center`}>
        {/* Ícone de erro */}
        <div className={tw`mb-8`}>
          <div className={tw`inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-4`}>
            <AlertTriangle className={tw`w-12 h-12 text-purple-600`} />
          </div>
          <h1 className={tw`text-6xl font-bold text-gray-800 mb-2`}>404</h1>
          <h2 className={tw`text-2xl font-semibold text-gray-700 mb-4`}>
            Página não encontrada
          </h2>
        </div>

        {/* Mensagem explicativa */}
        <div className={tw`bg-white rounded-xl shadow-lg p-6 mb-8`}>
          <p className={tw`text-gray-600 mb-4`}>
            Oops! A página que você está procurando não existe ou foi movida.
          </p>
          <div className={tw`bg-purple-50 border border-purple-200 rounded-lg p-4 text-left`}>
            <p className={tw`text-sm text-purple-700 font-medium mb-2`}>
              Possíveis causas:
            </p>
            <ul className={tw`text-sm text-purple-600 space-y-1`}>
              <li className={tw`flex items-center`}>
                <span className={tw`w-1.5 h-1.5 bg-purple-400 rounded-full mr-2`}></span>
                URL digitada incorretamente
              </li>
              <li className={tw`flex items-center`}>
                <span className={tw`w-1.5 h-1.5 bg-purple-400 rounded-full mr-2`}></span>
                Link quebrado ou desatualizado
              </li>
              <li className={tw`flex items-center`}>
                <span className={tw`w-1.5 h-1.5 bg-purple-400 rounded-full mr-2`}></span>
                Página removida ou movida
              </li>
            </ul>
          </div>
        </div>

        {/* Botões de ação */}
        <div className={tw`space-y-4`}>
          <div className={tw`flex flex-col sm:flex-row gap-4 justify-center`}>
            <Link
              href="/"
              className={tw`inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg`}
            >
              <Home className={tw`w-5 h-5 mr-2`} />
              Página Inicial
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className={tw`inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg`}
            >
              <ArrowLeft className={tw`w-5 h-5 mr-2`} />
              Voltar
            </button>
          </div>        
        </div>

        {/* Rodapé */}
        <div className={tw`mt-12 text-xs text-gray-400`}>
          <p>Picture Events © 2024</p>
        </div>
      </div>
    </div>
  );
}