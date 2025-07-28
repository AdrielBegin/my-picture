'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { tw } from 'twind';

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
        setTimeout(() => router.push('/routes/dashboard'), 2000);
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

  return (
    <div className={tw`flex flex-col lg:flex-row h-screen`}>
      <div className={tw`hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-blue-800 items-center justify-center p-12`}>
        <div className={tw`max-w-md text-white`}>
          <h1 className={tw`text-4xl font-bold mb-6`}>Sejam Bem-vindo</h1>
          <p className={tw`text-xl  mb-8`}>
            Acesse sua conta para gerenciar suas fotos.
          </p>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className={tw`w-full lg:w-1/2 flex items-center justify-center p-8 h-screen`}>
        <div className={tw`max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg`}>
          <ToastContainer />
          <div className={tw`text-center`}>
            <h2 className={tw`mt-6 text-3xl font-extrabold text-gray-900`}>Acesse sua conta</h2>
          </div>
          <form className={tw`mt-8 space-y-6`} onSubmit={handleLogin}>
            <div className={tw`rounded-md shadow-sm space-y-4`}>
              <div>
                <label htmlFor="email" className={tw`block text-sm font-medium text-gray-700`}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={tw`mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className={tw`block text-sm font-medium text-gray-700`}>
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={tw`mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={tw`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className={tw`animate-spin -ml-1 mr-3 h-5 w-5 text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className={tw`opacity-25`} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className={tw`opacity-75`} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}