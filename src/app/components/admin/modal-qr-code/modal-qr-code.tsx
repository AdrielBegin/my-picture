// src/app/components/admin/modal-qr-code/modal-qr-code.tsx
'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

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

    // Baixa o QR Code como PDF com indicador de progresso
    const handleDownloadPDF = async () => {
        if (!qrCodeImage || !eventData) {
            toast.error('QR Code não disponível para download');
            return;
        }

        if (isDownloading) {
            return; // Evita múltiplos downloads simultâneos
        }

        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            // Simula progresso durante a geração
            const updateProgress = (progress: number) => {
                setDownloadProgress(progress);
            };

            updateProgress(10);
            await new Promise(resolve => setTimeout(resolve, 100));

            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            updateProgress(25);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Adiciona gradiente de fundo
            pdf.setFillColor(240, 248, 255); // Alice Blue
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            // Adiciona borda decorativa
            pdf.setDrawColor(59, 130, 246); // Blue-500
            pdf.setLineWidth(2);
            pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

            updateProgress(40);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Título com estilo melhorado
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(30, 58, 138); // Blue-900
            const title = 'QR Code do Evento';
            const titleWidth = pdf.getTextWidth(title);
            const titleX = (pageWidth - titleWidth) / 2;
            pdf.text(title, titleX, 35);

            // Linha decorativa sob o título
            pdf.setDrawColor(59, 130, 246);
            pdf.setLineWidth(1);
            pdf.line(titleX, 40, titleX + titleWidth, 40);

            updateProgress(55);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Informações do evento com melhor formatação
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
            pdf.setTextColor(55, 65, 81); // Gray-700

            const eventInfo = [
                `📅 Nome do Evento: ${eventName}`,
                eventData.local ? `📍 Local: ${eventData.local}` : '',
                eventData.typeEvent ? `🎯 Tipo: ${eventData.typeEvent}` : '',
                eventData.dataEvent ? `📆 Data: ${new Date(eventData.dataEvent.toDate()).toLocaleDateString('pt-BR')}` : ''
            ].filter(Boolean);

            let currentY = 60;
            eventInfo.forEach((info) => {
                const infoWidth = pdf.getTextWidth(info);
                const infoX = (pageWidth - infoWidth) / 2;
                pdf.text(info, infoX, currentY);
                currentY += 15;
            });

            updateProgress(70);
            await new Promise(resolve => setTimeout(resolve, 100));

            // QR Code com moldura
            const qrSize = 120;
            const qrX = (pageWidth - qrSize) / 2;
            const qrY = currentY + 15;
            
            // Moldura do QR Code
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(59, 130, 246);
            pdf.setLineWidth(3);
            pdf.rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 'FD');
            
            pdf.addImage(qrCodeImage, 'PNG', qrX, qrY, qrSize, qrSize);

            updateProgress(85);
            await new Promise(resolve => setTimeout(resolve, 100));

            // URL com melhor formatação
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(107, 114, 128); // Gray-500
            const urlY = qrY + qrSize + 25;
            const urlToShow = eventData.urlQrCode || eventUrl;
            
            // Caixa para a URL
            pdf.setFillColor(249, 250, 251); // Gray-50
            pdf.setDrawColor(209, 213, 219); // Gray-300
            pdf.setLineWidth(0.5);
            pdf.rect(20, urlY - 8, pageWidth - 40, 20, 'FD');
            
            const urlLines = pdf.splitTextToSize(urlToShow, pageWidth - 50);
            urlLines.forEach((line: string, index: number) => {
                const lineWidth = pdf.getTextWidth(line);
                const lineX = (pageWidth - lineWidth) / 2;
                pdf.text(line, lineX, urlY + (index * 10));
            });

            updateProgress(95);
            await new Promise(resolve => setTimeout(resolve, 100));

            // Rodapé estilizado
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(156, 163, 175); // Gray-400
            const footerText = `✨ Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
            const footerWidth = pdf.getTextWidth(footerText);
            const footerX = (pageWidth - footerWidth) / 2;
            pdf.text(footerText, footerX, pageHeight - 25);

            updateProgress(100);
            await new Promise(resolve => setTimeout(resolve, 200));

            const eventNameSafe = eventName ? eventName.replace(/\s+/g, '_') : 'Evento_Desconhecido';
            const fileName = `QRCode_${eventNameSafe}_${new Date().getTime()}.pdf`;
            pdf.save(fileName);

            toast.success('PDF baixado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            toast.error('Erro ao gerar PDF. Tente novamente.');
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
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

    const modalContent = (
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
                                        disabled={isDownloading}
                                        className={tw`relative flex items-center gap-2 px-4 py-2 ${
                                            isDownloading 
                                                ? 'bg-blue-100 text-blue-700 cursor-not-allowed' 
                                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        } rounded-lg transition-all duration-300 overflow-hidden`}
                                    >
                                        {isDownloading && (
                                            <div 
                                                className={tw`absolute inset-0 bg-gradient-to-r from-blue-200 to-blue-300 transition-all duration-300`}
                                                style={{ width: `${downloadProgress}%` }}
                                            />
                                        )}
                                        <div className={tw`relative z-10 flex items-center gap-2`}>
                                            {isDownloading ? (
                                                <div className={tw`animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent`} />
                                            ) : (
                                                <Download size={16} />
                                            )}
                                            <span>
                                                {isDownloading 
                                                    ? `Gerando PDF... ${downloadProgress}%` 
                                                    : 'Baixar PDF'
                                                }
                                            </span>
                                        </div>
                                    </button>
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

    return createPortal(modalContent, document.body);
}