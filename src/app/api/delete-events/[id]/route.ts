// app/api/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  doc, 
  deleteDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  writeBatch 
} from 'firebase/firestore';

// Tipo para os parâmetros da rota
interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * DELETE /api/events/[id]
 * Deleta um evento específico por ID e todas as fotos relacionadas
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = params;

    // Validação do ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID do evento é obrigatório e deve ser uma string válida' },
        { status: 400 }
      );
    }

    // Referência do documento do evento
    const eventRef = doc(db, 'events', id);

    // Verifica se o evento existe
    const eventSnap = await getDoc(eventRef);
    
    if (!eventSnap.exists()) {
      return NextResponse.json(
        { 
          error: 'Evento não encontrado',
          eventId: id 
        },
        { status: 404 }
      );
    }

    // Busca todas as fotos relacionadas ao evento
    const photosRef = collection(db, 'photos');
    const photosQuery = query(photosRef, where('eventId', '==', id));
    const photosSnap = await getDocs(photosQuery);

    // Cria um batch para deletar tudo de uma vez (mais eficiente)
    const batch = writeBatch(db);

    // Adiciona o evento ao batch para exclusão
    batch.delete(eventRef);

    // Adiciona todas as fotos ao batch para exclusão
    const deletedPhotosIds: string[] = [];
    photosSnap.forEach((photoDoc) => {
      batch.delete(photoDoc.ref);
      deletedPhotosIds.push(photoDoc.id);
    });

    // Executa todas as exclusões de uma vez
    await batch.commit();

    // Resposta de sucesso com informações detalhadas
    return NextResponse.json(
      {
        message: 'Evento e fotos relacionadas deletados com sucesso',
        eventId: id,
        deletedPhotosCount: deletedPhotosIds.length,
        deletedPhotosIds: deletedPhotosIds,
        deletedAt: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao deletar evento e fotos:', error);

    // Tratamento de diferentes tipos de erro
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Erro ao deletar evento e fotos relacionadas',
          details: error.message 
        },
        { status: 500 }
      );
    }

    // Erro genérico
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}