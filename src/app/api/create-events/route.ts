// src/app/api/create-events/route.ts
import { db } from '@/lib/firebase';
import { Event } from '@/types/event';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, local, typeEvent } = body;

    if (!eventName || !local || !typeEvent) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    // 1. Cria o evento inicial
    const docRef = await addDoc(collection(db, 'events'), {
      eventName,
      local,
      typeEvent,
      createdAt: new Date(),
      dataEvent: body.dataEvent ? new Date(body.dataEvent + 'T12:00:00') : null,
    });

    const eventId = docRef.id;
    const baseUrl = "https://my-picture-fouet-de-caramelo.vercel.app";
    
    const eventUrl = `${baseUrl}/?eventId=${eventId}&eventName=${encodeURIComponent(eventName)}`;

    console.log('URL do evento gerada com sucesso:', baseUrl);
    // 2. Gera o QR Code como base64
    let qrCodeBase64 = '';
    try {
      qrCodeBase64 = await QRCode.toDataURL(eventUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      console.log('QR Code gerado com sucesso');
    } catch (qrError) {
      console.error('Erro ao gerar QR Code:', qrError);
      // Continue sem o QR Code se houver erro
    }

    // 3. Atualiza o documento com a URL e o QR Code
    const updateData: Partial<Event> = {
      urlQrCode: eventUrl
    };

    // Só adiciona o QR Code se foi gerado com sucesso
    if (qrCodeBase64) {
      updateData.qrCodeImage = qrCodeBase64; // aqui vai dar erro se não existir no Event
      updateData.qrCodeGeneratedAt = new Date(); // idem
    }

    await updateDoc(doc(db, 'events', eventId), updateData);

    return NextResponse.json({
      message: 'Evento criado com sucesso',
      id: eventId,
      url: eventUrl,
      qrCodeGenerated: !!qrCodeBase64 // Indica se o QR Code foi gerado
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao cadastrar evento:', error);
    return NextResponse.json({
      message: 'Erro interno ao criar evento',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
