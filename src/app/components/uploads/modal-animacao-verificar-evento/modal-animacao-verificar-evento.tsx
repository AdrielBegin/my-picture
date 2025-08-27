import { tw } from "twind";

export default function ModalAnimacaoVerificarEvento() {
    return (
        <div className={tw`min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4`}>
            <div className={tw`max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6`}>
                <div className={tw`text-center`}>
                    <div className={tw`animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4`}></div>
                    <p className={tw`text-gray-600`}>Verificando evento...</p>
                </div>
            </div>
        </div>
    );
}
