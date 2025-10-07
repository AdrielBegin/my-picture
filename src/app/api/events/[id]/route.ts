import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Event } from '@/types/event';
import { Timestamp } from "firebase/firestore";

// Tipo para os parâmetros da rota
interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { eventName, local, typeEvent, dataEvent, status } = body;
    const eventNameTrimmed = typeof eventName === 'string' ? eventName.trim() : '';

    if (!eventNameTrimmed || !local || !typeEvent || !dataEvent) {
      return NextResponse.json(
        { message: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      );
    }

    if (eventNameTrimmed.length > 100) {
      return NextResponse.json(
        { message: 'Nome do evento deve ter no máximo 100 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se o evento existe
    const eventRef = doc(db, 'events', id);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      return NextResponse.json(
        { message: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    // Preparar dados para atualização (preservar status existente se não for enviado)
    const updateData: Partial<Event> = {
      eventName: eventNameTrimmed,
      local,
      typeEvent,
    };

    // Atualizar data do evento somente se fornecida
    if (dataEvent) {
      updateData.dataEvent = Timestamp.fromDate(new Date(dataEvent + "T12:00:00"));
    }

    // Atualizar status somente se fornecido explicitamente
    if (typeof status === 'string' && status.length > 0) {
      updateData.status = status;
    }

    // Atualizar o evento
    await updateDoc(eventRef, updateData);

    return NextResponse.json(
      {
        message: 'Evento atualizado com sucesso',
        id,
        data: updateData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return NextResponse.json(
      {
        message: 'Erro interno ao atualizar evento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para buscar um evento específico
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const eventRef = doc(db, 'events', id);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      return NextResponse.json(
        { message: 'Evento não encontrado' },
        { status: 404 }
      );
    }

    const eventData = {
      eventId: eventDoc.id,
      ...eventDoc.data()
    };

    return NextResponse.json(eventData, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json(
      {
        message: 'Erro interno ao buscar evento',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}