// src/app/api/create-events/route.ts
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, local, typeEvent } = body;

    if (!eventName || !local || !typeEvent) {
      return NextResponse.json({ message: 'Todos os campos são obrigatórios' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'events'), {
      eventName,
      local,
      typeEvent,
      createdAt: new Date(),
      dataEvent: body.dataEvent ? new Date(body.dataEvent + 'T12:00:00') : null,
    });
    const eventId = docRef.id;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const eventUrl = `${baseUrl}/?eventId=${eventId}&&eventName=${encodeURIComponent(eventName)}`;
    console.log(`Evento criado com ID: ${eventId}, URL: ${eventUrl}`);

    return NextResponse.json({
      message: 'Evento criado com sucesso',
      id: eventId,
      url: eventUrl
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar evento:', error);
    return NextResponse.json({ message: 'Erro interno ao criar evento' }, { status: 500 });
  }
}
