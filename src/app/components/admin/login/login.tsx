'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { tw } from 'twind';
import { Camera, Lock, Mail, Image, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success('Login realizado com sucesso!');
        router.push('/routes/meus-eventos');
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Credenciais inválidas');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <div className={tw`flex flex-col lg:flex-row h-screen bg-gradient-to-b from-blue-50 to-indigo-100 login-container`}>
      {/* Lado esquerdo - Banner */}
      <div className={tw`hidden lg:flex w-1/2 bg-gradient-to-br from-[#40B1C4] to-[#40B1C4] items-center justify-center p-12 relative overflow-hidden`}>
        <div className={tw`absolute inset-0 bg-black opacity-10 z-0`}></div>
        <div className={tw`absolute -bottom-20 -left-20 w-64 h-64 bg-white opacity-10 rounded-full`}></div>
        <div className={tw`absolute -top-20 -right-20 w-80 h-80 bg-white opacity-10 rounded-full`}></div>

        <div className={tw`max-w-md text-white z-10 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className={tw`flex items-center mb-8`}>
            <Camera size={40} className={tw`mr-3`} />
            <h1 className={tw`text-3xl font-bold`}>Fouet Caramelo</h1>
          </div>
          <h2 className={tw`text-4xl font-bold mb-6 leading-tight`}>Seja Bem-vindo ao Gerenciador de Eventos</h2>
          <p className={tw`text-xl mb-8 text-blue-100`}>
            Acesse sua conta para gerenciar suas fotos e eventos de forma simples e eficiente.
          </p>
          <div className={tw`flex space-x-2`}>
            <div className={tw`w-3 h-3 rounded-full bg-white opacity-70`}></div>
            <div className={tw`w-3 h-3 rounded-full bg-white`}></div>
            <div className={tw`w-3 h-3 rounded-full bg-white opacity-70`}></div>
          </div>
        </div>
      </div>

      {/* Mobile Banner - Visível apenas em dispositivos móveis */}
      <div className={tw`lg:hidden w-full flex flex-col items-center justify-center py-4 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 relative overflow-hidden mobile-banner-compact ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className={tw`absolute inset-0 bg-pattern opacity-10 z-0`}></div>
        <div className={tw`absolute -bottom-8 -left-8 w-24 h-24 bg-white opacity-10 rounded-full`}></div>
        <div className={tw`absolute -top-8 -right-8 w-32 h-32 bg-white opacity-10 rounded-full`}></div>

        <div className={tw`flex items-center mb-2 z-10`}>
          <Camera size={28} className={tw`mr-2 text-white`} />
          <h1 className={tw`text-xl font-bold text-white`}>Picture Events</h1>
        </div>
        <p className={tw`text-center text-white text-xs leading-tight z-10`}>
          Gerencie suas fotos e eventos de forma simples
        </p>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className={tw`w-full lg:w-1/2 flex items-center justify-center p-3 sm:p-8 h-auto lg:h-screen form-container-compact`}>
        <div className={tw`max-w-sm w-full space-y-4 bg-white/90 backdrop-blur-sm p-4 sm:p-10 rounded-2xl shadow-xl form-card-compact ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className={tw`text-center`}>
            <div className={tw`inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#9D6433] text-white mb-3 shadow-md`}>
              <User size={20} />
            </div>
            <h2 className={tw`text-xl sm:text-3xl font-bold text-gray-900 mb-1`}>Acesse sua conta</h2>
            <p className={tw`text-sm text-gray-600`}>Entre com suas credenciais para continuar</p>
          </div>

          <form className={tw`mt-4 space-y-4`} onSubmit={handleLogin}>
            <div className={tw`space-y-3`}>
              <div>
                <label htmlFor="email" className={tw`block text-sm font-medium text-gray-700 mb-1`}>
                  Email
                </label>
                <div className={tw`relative`}>
                  <div className={tw`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500`}>
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={tw`pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 bg-white/80 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm input-compact`}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <div className={tw`flex items-center justify-between mb-1`}>
                  <label htmlFor="password" className={tw`block text-sm font-medium text-gray-700`}>
                    Senha
                  </label>
                </div>
                <div className={tw`relative`}>
                  <div className={tw`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500`}>
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={tw`pl-10 appearance-none block w-full px-3 py-3 border border-gray-300 bg-white/80 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm input-compact`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={tw`
                group relative w-full flex justify-center 
                py-3 px-4 
                border border-transparent 
                text-sm font-medium 
                rounded-xl 
                text-white 
                bg-[#9D6433] 
                hover:bg-[#c0a37b] 
                focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-[#c0a37b] 
                transition-all duration-200 
                shadow-md hover:shadow-lg 
                ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}
              `}
              >
                {isLoading ? (
                  <>
                    <svg
                      className={tw`animate-spin -ml-1 mr-3 h-5 w-5 text-white`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className={tw`opacity-25`}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className={tw`opacity-75`}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Carregando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          <div className={tw`text-center text-xs text-gray-600 mt-4`}>
            <p>© {new Date().getFullYear()} Fouet Caramelo. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}