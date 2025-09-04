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
    const [showPreview, setShowPreview] = useState(false);
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string>('');
    const [showPdfOptions, setShowPdfOptions] = useState(false);
    const [pdfOptions, setPdfOptions] = useState({
        format: 'a4' as 'a4' | 'letter' | 'a3',
        orientation: 'portrait' as 'portrait' | 'landscape'
    });

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

    // Gera o PDF e retorna o blob
    const generatePDF = async () => {
        try {
            // Validações iniciais
            if (!qrCodeImage) {
                throw new Error('QR Code não foi gerado. Tente gerar o QR Code novamente.');
            }
            
            if (!eventData) {
                throw new Error('Dados do evento não encontrados. Verifique se o evento foi carregado corretamente.');
            }

            if (!eventName) {
                throw new Error('Nome do evento não encontrado. Verifique se o evento foi carregado corretamente.');
            }

            const updateProgress = (progress: number) => {
                setDownloadProgress(progress);
            };

            updateProgress(10);
            await new Promise(resolve => setTimeout(resolve, 100));

        const pdf = new jsPDF({
            orientation: pdfOptions.orientation,
            unit: 'mm',
            format: pdfOptions.format
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        updateProgress(25);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verifica se o PDF foi criado corretamente
        if (!pdf) {
            throw new Error('Erro ao inicializar o documento PDF. Tente novamente.');
        }

        // Adiciona gradiente de fundo
        try {
            pdf.setFillColor(240, 248, 255); // Alice Blue
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        } catch (error) {
            console.warn('Erro ao adicionar fundo do PDF:', error);
            // Continua sem o fundo se houver erro
        }

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

        updateProgress(90);
        await new Promise(resolve => setTimeout(resolve, 200));

        let pdfResult: jsPDF;
        try {
            pdfResult = pdf;
            
            // Verifica se o PDF foi gerado corretamente
            if (!pdfResult) {
                throw new Error('Erro ao gerar o arquivo PDF. O arquivo está vazio.');
            }
            
        } catch (error) {
            throw new Error(`Erro ao finalizar o PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
        
        updateProgress(100);
        return pdfResult;
        
        } catch (error) {
            // Reset do progresso em caso de erro
            setDownloadProgress(0);
            
            // Log do erro para debug
            console.error('Erro na geração do PDF:', error);
            
            // Re-throw com mensagem mais amigável
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error('Erro inesperado ao gerar o PDF. Tente novamente.');
            }
        }
    };

    // Mostra o preview do PDF
    const handlePreviewPDF = async () => {
        if (!qrCodeImage || !eventData) {
            toast.error('QR Code não disponível para preview');
            return;
        }

        if (isDownloading) {
            return;
        }

        setIsDownloading(true);
        setDownloadProgress(0);

        try {
            const pdf = await generatePDF();
            
            // Verifica se o PDF foi criado
            if (!pdf) {
                throw new Error('Falha ao gerar o PDF para preview.');
            }
            
            const pdfBlob = pdf.output('blob');
            
            // Verifica se o blob foi criado corretamente
            if (!pdfBlob || pdfBlob.size === 0) {
                throw new Error('Erro ao gerar o arquivo PDF. O arquivo está vazio.');
            }
            
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            // Verifica se a URL foi criada corretamente
            if (!pdfUrl) {
                throw new Error('Erro ao criar URL para preview do PDF.');
            }
            
            setPreviewPdfUrl(pdfUrl);
            setShowPreview(true);
            toast.success('Preview gerado com sucesso!');
        } catch (error) {
            console.error('Erro ao gerar preview:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar preview';
            toast.error(`Erro no preview: ${errorMessage}`);
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    // Baixa o PDF diretamente
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
            const pdf = await generatePDF();
            
            // Verifica se o PDF foi criado
            if (!pdf) {
                throw new Error('Falha ao gerar o arquivo PDF.');
            }
            
            // Cria nome do arquivo seguro
            const safeName = eventName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Evento_Desconhecido';
            const timestamp = new Date().getTime();
            const fileName = `QRCode_${safeName}_${timestamp}.pdf`;
            
            try {
                pdf.save(fileName);
                toast.success(`PDF "${fileName}" baixado com sucesso!`);
            } catch (downloadError) {
                throw new Error('Erro ao iniciar o download do arquivo.');
            }
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no download';
            toast.error(`Erro no download: ${errorMessage}`);
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    // Baixa o PDF do preview
    const handleDownloadFromPreview = () => {
        if (previewPdfUrl) {
            const eventNameSafe = eventName ? eventName.replace(/\s+/g, '_') : 'Evento_Desconhecido';
            const fileName = `QRCode_${eventNameSafe}_${new Date().getTime()}.pdf`;
            const link = document.createElement('a');
            link.href = previewPdfUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('PDF baixado com sucesso!');
        }
    };

    // Fecha o preview e limpa a URL
    const handleClosePreview = () => {
        if (previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl);
            setPreviewPdfUrl('');
        }
        setShowPreview(false);
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
                                        onClick={() => setShowPdfOptions(!showPdfOptions)}
                                        className={tw`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors`}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2583 9.77251 19.9887C9.5799 19.7191 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.74171 9.96512 4.01131 9.77251C4.28091 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>Opções</span>
                                    </button>

                                    <button
                                        onClick={handlePreviewPDF}
                                        disabled={isDownloading}
                                        className={tw`relative flex items-center gap-2 px-4 py-2 ${
                                            isDownloading 
                                                ? 'bg-purple-100 text-purple-700 cursor-not-allowed' 
                                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                        } rounded-lg transition-all duration-300 overflow-hidden`}
                                    >
                                        {isDownloading && (
                                            <div 
                                                className={tw`absolute inset-0 bg-gradient-to-r from-purple-200 to-purple-300 transition-all duration-300`}
                                                style={{ width: `${downloadProgress}%` }}
                                            />
                                        )}
                                        <div className={tw`relative z-10 flex items-center gap-2`}>
                                            {isDownloading ? (
                                                <div className={tw`animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent`} />
                                            ) : (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V8L15 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M15 3V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M10 12L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            )}
                                            <span>
                                                {isDownloading 
                                                    ? `Gerando Preview... ${downloadProgress}%` 
                                                    : 'Preview PDF'
                                                }
                                            </span>
                                        </div>
                                    </button>

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
                                                    ? `Baixando PDF... ${downloadProgress}%` 
                                                    : 'Baixar PDF'
                                                }
                                            </span>
                                        </div>
                                    </button>
                                </div>

                                {/* PDF Options Menu */}
                                {showPdfOptions && (
                                    <div className={tw`absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 min-w-[280px]`}>
                                        <h4 className={tw`text-sm font-semibold text-gray-800 mb-3`}>Opções do PDF</h4>
                                        
                                        <div className={tw`space-y-3`}>
                                            {/* Formato */}
                                            <div>
                                                <label className={tw`block text-xs font-medium text-gray-700 mb-2`}>Formato</label>
                                                <div className={tw`grid grid-cols-3 gap-2`}>
                                                    {(['a4', 'letter', 'a3'] as const).map((format) => (
                                                        <button
                                                            key={format}
                                                            onClick={() => setPdfOptions(prev => ({ ...prev, format }))}
                                                            className={tw`px-3 py-2 text-xs rounded-md border transition-colors ${
                                                                pdfOptions.format === format
                                                                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {format.toUpperCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Orientação */}
                                            <div>
                                                <label className={tw`block text-xs font-medium text-gray-700 mb-2`}>Orientação</label>
                                                <div className={tw`grid grid-cols-2 gap-2`}>
                                                    {(['portrait', 'landscape'] as const).map((orientation) => (
                                                        <button
                                                            key={orientation}
                                                            onClick={() => setPdfOptions(prev => ({ ...prev, orientation }))}
                                                            className={tw`px-3 py-2 text-xs rounded-md border transition-colors flex items-center gap-2 ${
                                                                pdfOptions.orientation === orientation
                                                                    ? 'bg-purple-100 border-purple-300 text-purple-700'
                                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {orientation === 'portrait' ? (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <rect x="6" y="2" width="12" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                                                </svg>
                                                            ) : (
                                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <rect x="2" y="6" width="20" height="12" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                                                                </svg>
                                                            )}
                                                            <span>{orientation === 'portrait' ? 'Retrato' : 'Paisagem'}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={tw`mt-4 pt-3 border-t border-gray-100 flex justify-end`}>
                                            <button
                                                onClick={() => setShowPdfOptions(false)}
                                                className={tw`px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors`}
                                            >
                                                Fechar
                                            </button>
                                        </div>
                                    </div>
                                )}

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

    // Modal de Preview do PDF
    const previewModalContent = showPreview && (
        <>
            <div className={tw`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4`}>
                <div className={tw`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col`}>
                    {/* Header do Preview */}
                    <div className={tw`flex items-center justify-between p-6 border-b border-gray-200`}>
                        <div>
                            <h3 className={tw`text-xl font-bold text-gray-900`}>Preview do PDF</h3>
                            <p className={tw`text-sm text-gray-600 mt-1`}>Visualize antes de baixar</p>
                        </div>
                        <div className={tw`flex items-center gap-3`}>
                            <button
                                onClick={handleDownloadFromPreview}
                                className={tw`flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors`}
                            >
                                <Download size={16} />
                                <span>Baixar PDF</span>
                            </button>
                            <button
                                onClick={handleClosePreview}
                                className={tw`p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Conteúdo do Preview */}
                    <div className={tw`flex-1 p-6 overflow-hidden`}>
                        {previewPdfUrl ? (
                            <div className={tw`w-full h-full bg-gray-100 rounded-lg overflow-hidden shadow-inner`}>
                                <iframe
                                    src={previewPdfUrl}
                                    className={tw`w-full h-full border-0`}
                                    title="Preview do PDF"
                                    style={{ minHeight: '500px' }}
                                />
                            </div>
                        ) : (
                            <div className={tw`flex items-center justify-center h-64 bg-gray-50 rounded-lg`}>
                                <div className={tw`text-center`}>
                                    <div className={tw`animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4`} />
                                    <p className={tw`text-gray-600`}>Carregando preview...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer do Preview */}
                    <div className={tw`flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl`}>
                        <div className={tw`text-sm text-gray-600`}>
                            <p>💡 <strong>Dica:</strong> Use Ctrl+Scroll para ajustar o zoom no preview</p>
                        </div>
                        <div className={tw`flex items-center gap-2`}>
                            <button
                                onClick={handleClosePreview}
                                className={tw`px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors`}
                            >
                                Fechar
                            </button>
                            <button
                                onClick={handleDownloadFromPreview}
                                className={tw`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors`}
                            >
                                <Download size={16} />
                                <span>Baixar Agora</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            {createPortal(modalContent, document.body)}
            {showPreview && createPortal(previewModalContent, document.body)}
        </>
    );
}