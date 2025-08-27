// src/app/api/get-event/%5Bid%5D/route.ts
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { message: 'Event ID é obrigatório' }, 
        { status: 400 }
      );
    }

    // Busca o evento no Firestore
    const eventRef = doc(db, 'events', id);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      return NextResponse.json(
        { message: 'Evento não encontrado' }, 
        { status: 404 }
      );
    }

    const eventData = {
      id: eventSnap.id,
      ...eventSnap.data()
    };

    return NextResponse.json({
      success: true,
      event: eventData
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro interno do servidor' 
      }, 
      { status: 500 }
    );
  }
}