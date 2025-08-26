
'use client';
import { FiLoader } from 'react-icons/fi';
import { tw } from 'twind';

export default function TelaLoading() {
    return (
        <div className={tw`absolute inset-0 bg-white bg-opacity-80 rounded-2xl flex items-center justify-center z-10`}>
            <div className={tw`flex flex-col items-center gap-3`}>
                <FiLoader className={tw`animate-spin text-blue-600 w-8 h-8`} />
                <span className={tw`text-gray-600 font-medium`}>Cadastrando evento...</span>
            </div>
        </div>
    );
}