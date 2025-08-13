// src/app/components/admin/modal-qr-code/modal-qr-code.tsx
'use client';
import { useState, useEffect } from 'react';
import { tw } from 'twind';
import { toast } from 'react-toastify';
import { X, Download, ExternalLink, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';

interface ModalQRCodeProps {
    isOpen: boolean;
    eventId: string;
    eventName: string;
    eventUrl: string;
    onClose: () => void;
}

interface EventData {
    id: string;
    eventName: string;
    local?: string;
    typeEvent?: string;
    dataEvent?: Timestamp | null;
    urlQrCode: string;
    qrCodeImage?: string;
    qrCodeImageUrl?: string;
    qrCodeGeneratedAt?: Timestamp;
}

export default function ModalQRCode({ isOpen, eventId, eventName, eventUrl, onClose }: ModalQRCodeProps) {
    const [loading, setLoading] = useState(false);
    const [eventData, setEventData] = useState<EventData | null>(null);
    const [qrCodeImage, setQrCodeImage] = useState<string>('');
    const [error, setError] = useState<string>('');

    const fetchEventData = async () => {
        if (!eventId) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/get-event/${eventId}`);

            if (!response.ok) {
                console.log(`Erro na API: ${response.status}`);
            }

            const event = await response.json();

            if (!event) {
                throw new Error('Evento não encontrado');
            }

            setEventData(event);

            console.log("event.id", event);

            // Verifica se tem QR Code salvo no banco
            if (event.qrCodeImage) {
                setQrCodeImage(event.qrCodeImage);
            } else if (event.qrCodeImageUrl) {
                setQrCodeImage(event.qrCodeImageUrl);
            } else {
                // Se não tem QR Code salvo, gera um novo
                const urlToUse = event.urlQrCode || eventUrl;
                if (urlToUse) {
                    await generateQRCode(urlToUse);
                } else {
                    throw new Error('URL do evento não encontrada');
                }
            }

        } catch (error) {
            console.error('Erro ao buscar dados do evento:', error);
            setError('Erro ao carregar dados do evento');

            if (eventUrl) {
                await generateQRCode(eventUrl);
            }
        } finally {
            setLoading(false);
        }
    };

    // Gera QR Code caso não exista no banco
    const generateQRCode = async (url: string) => {
        if (!url || typeof url !== 'string') {
            setError('URL inválida para geração do QR Code');
            return;
        }

        try {
            const qrDataUrl = await QRCode.toDataURL(url, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });
            setQrCodeImage(qrDataUrl);
        } catch (error) {
            console.error('Erro ao gerar QR Code:', error);
            setError('Erro ao gerar QR Code. Verifique se a URL é válida.');
        }
    };

    // Copia a URL para a área de transferência
    const handleCopyUrl = async () => {
        const urlToCopy = eventData?.urlQrCode || eventUrl;

        if (!urlToCopy) {
            toast.error('URL não encontrada');
            return;
        }

        try {
            await navigator.clipboard.writeText(urlToCopy);
            toast.success('URL copiada para a área de transferência!');
        } catch (error) {
            console.error('Erro ao copiar URL:', error);
            toast.error('Erro ao copiar URL');
        }
    };

    // Baixa o QR Code como PDF
    const handleDownloadPDF = () => {

        if (!qrCodeImage || !eventData) {
            toast.error('QR Code não disponível para download');
            return;
        }

        try {
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Título
            pdf.setFontSize(22);
            pdf.setFont('helvetica', 'bold');
            const title = 'QR Code do Evento';
            const titleWidth = pdf.getTextWidth(title);
            const titleX = (pageWidth - titleWidth) / 2;
            pdf.text(title, titleX, 40);

            // Informações do evento
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(14);

            const eventInfo = [
                `Nome do Evento: ${eventName}`,
                eventData.local ? `Local: ${eventData.local}` : '',
                eventData.typeEvent ? `Tipo: ${eventData.typeEvent}` : '',
                eventData.dataEvent ? `Data: ${new Date(eventData.dataEvent.toDate()).toLocaleDateString('pt-BR')}` : ''
            ].filter(Boolean);

            let currentY = 70;
            eventInfo.forEach((info) => {
                const infoWidth = pdf.getTextWidth(info);
                const infoX = (pageWidth - infoWidth) / 2;
                pdf.text(info, infoX, currentY);
                currentY += 20;
            });

            // QR Code
            const qrSize = 100;
            const qrX = (pageWidth - qrSize) / 2;
            const qrY = currentY + 20;
            pdf.addImage(qrCodeImage, 'PNG', qrX, qrY, qrSize, qrSize);

            // URL
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            const urlY = qrY + qrSize + 30;
            const urlToShow = eventData.urlQrCode || eventUrl;
            const urlLines = pdf.splitTextToSize(urlToShow, pageWidth - 40);

            urlLines.forEach((line: string, index: number) => {
                const lineWidth = pdf.getTextWidth(line);
                const lineX = (pageWidth - lineWidth) / 2;
                pdf.text(line, lineX, urlY + (index * 12));
            });

            // Rodapé
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            const footerText = `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
            const footerWidth = pdf.getTextWidth(footerText);
            const footerX = (pageWidth - footerWidth) / 2;
            pdf.text(footerText, footerX, pageHeight - 20);

            const eventNameSafe = eventName ? eventName.replace(/\s+/g, '_') : 'Evento_Desconhecido';
            const fileName = `QRCode_${eventNameSafe}_${new Date().getTime()}.pdf`;
            pdf.save(fileName);

            toast.success('PDF baixado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            toast.error('Erro ao gerar PDF');
        }
    };

    // Carrega os dados quando o modal abre
    useEffect(() => {
        if (isOpen && eventId) {
            fetchEventData();
        }
    }, [isOpen, eventId]);

    // Limpa os dados quando o modal fecha
    useEffect(() => {
        if (!isOpen) {
            setEventData(null);
            setQrCodeImage('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={tw`fullscreen-overlay inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-[9999]`}
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className={tw`bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={tw`flex justify-between items-center p-6 border-b`}>
                        <h2 className={tw`text-xl font-bold text-gray-800`}>QR Code do Evento</h2>
                        <button
                            onClick={onClose}
                            className={tw`p-1 hover:bg-gray-100 rounded-full transition-colors`}
                        >
                            <X size={24} className={tw`text-gray-500`} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className={tw`p-6`}>
                        {loading && (
                            <div className={tw`text-center py-8`}>
                                <div className={tw`animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4`}></div>
                                <p className={tw`text-gray-600`}>Carregando QR Code...</p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className={tw`text-center py-8`}>
                                <p className={tw`text-red-600 mb-4`}>{error}</p>
                                <button
                                    onClick={fetchEventData}
                                    className={tw`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        )}

                        {qrCodeImage && !loading && (
                            <>
                                {/* Event Info */}
                                <div className={tw`text-center mb-6`}>
                                    <h3 className={tw`text-lg font-semibold text-gray-800 mb-2`}>
                                        {eventData?.eventName || eventName}
                                    </h3>
                                    {eventData?.local && (
                                        <p className={tw`text-sm text-gray-600 mb-1`}>📍 {eventData.local}</p>
                                    )}
                                    {eventData?.typeEvent && (
                                        <p className={tw`text-sm text-gray-600 mb-1`}>🎉 {eventData.typeEvent}</p>
                                    )}
                                    {eventData?.dataEvent && (
                                        <p className={tw`text-sm text-gray-600`}>
                                            📅 {new Date(eventData.dataEvent.toDate()).toLocaleDateString('pt-BR')}
                                        </p>
                                    )}
                                </div>

                                {/* QR Code */}
                                <div className={tw`flex justify-center mb-6`}>
                                    <div className={tw`bg-white p-4 rounded-lg shadow-md border`}>

                                        <Image
                                            src={qrCodeImage}
                                            alt="QR Code do Evento"
                                            layout="responsive"
                                            width={64}
                                            height={64}
                                            className={tw`rounded-lg shadow-lg max-h-[80vh] w-auto object-contain`}
                                            style={{ maxHeight: 'auto' }}
                                        />
                                    </div>
                                </div>

                                {/* URL */}
                                <div className={tw`bg-gray-50 rounded-lg p-4 mb-6`}>
                                    <p className={tw`text-sm text-gray-600 mb-2`}>URL do evento:</p>
                                    <p className={tw`text-xs text-gray-800 break-all font-mono`}>
                                        {eventData?.urlQrCode || eventUrl}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className={tw`flex flex-wrap gap-2 justify-center`}>
                                    <button
                                        onClick={handleCopyUrl}
                                        className={tw`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors`}
                                    >
                                        <Copy size={16} />
                                        <span>Copiar URL</span>
                                    </button>

                                    <a
                                        href={eventData?.urlQrCode || eventUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={tw`flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors`}
                                    >
                                        <ExternalLink size={16} />
                                        <span>Abrir Link</span>
                                    </a>

                                    <button
                                        onClick={handleDownloadPDF}
                                        className={tw`flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors`}
                                    >
                                        <Download size={16} />
                                        <span>Baixar PDF</span>
                                    </button>

                                    {/* <button
                                        onClick={handleRegenerateQRCode}
                                        disabled={loading}
                                        className={tw`flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <RefreshCw size={16} className={loading ? tw`animate-spin` : ''} />
                                        <span>Regenerar</span>
                                    </button> */}
                                </div>

                                {/* QR Code Info */}
                                {eventData?.qrCodeGeneratedAt && (
                                    <div className={tw`text-center mt-4`}>
                                        <p className={tw`text-xs text-gray-500`}>
                                            QR Code gerado em: {new Date(eventData.qrCodeGeneratedAt.toDate()).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}