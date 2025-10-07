// src/app/api/get-event/%5Bid%5D/route.ts
import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const revalidate = 0;

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

    // Busca o evento no Firestore Admin (garante projeto correto no servidor)
    // Fallback para Firestore cliente em ambientes sem credenciais Admin
    let eventData: Record<string, unknown> | undefined;
    try {
      const adminSnap = await adminDb.collection('events').doc(id).get();
      if (!adminSnap.exists) {
        return NextResponse.json(
          { message: 'Evento não encontrado' }, 
          { status: 404 }
        );
      }
      eventData = { id: adminSnap.id, ...adminSnap.data() } as Record<string, unknown>;
    } catch (adminError) {
      console.warn('Admin Firestore indisponível, usando cliente. Detalhes:', adminError instanceof Error ? adminError.message : adminError);
      const clientRef = doc(db, 'events', id);
      const clientSnap = await getDoc(clientRef);
      if (!clientSnap.exists()) {
        return NextResponse.json(
          { message: 'Evento não encontrado' }, 
          { status: 404 }
        );
      }
      eventData = { id: clientSnap.id, ...clientSnap.data() } as Record<string, unknown>;
    }

    if (!eventData) {
      return NextResponse.json(
        { message: 'Evento não encontrado' }, 
        { status: 404 }
      );
    }

    const event = eventData;

    return NextResponse.json({
      success: true,
      event
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