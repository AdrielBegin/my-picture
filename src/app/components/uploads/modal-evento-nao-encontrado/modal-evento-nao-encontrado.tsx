
'use client';
import { tw } from "twind";

export default function ModalEventoNaoEncontrado() {
    return (
        <div className={tw`min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4`}>
            <div className={tw`max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6`}>
                <div className={tw`text-center space-y-4`}>
                    <div className={tw`text-6xl`}>❌</div>
                    <h1 className={tw`text-2xl font-bold text-red-600`}>
                        Evento não encontrado
                    </h1>
                    <p className={tw`text-gray-600`}>
                        O evento que você está tentando acessar não existe ou não está mais disponível.
                    </p>
                    <div className={tw`bg-red-50 border border-red-200 rounded-md p-4`}>
                        <p className={tw`text-sm text-red-700`}>
                            <strong>Possíveis causas:</strong>
                            <br />
                            • Link inválido ou expirado
                            <br />
                            • Evento removido pelo organizador
                            <br />
                            • Erro na URL
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
