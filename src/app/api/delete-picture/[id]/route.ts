// This file is part of the Next.js project and is used to handle the deletion of pictures from Firebase Storage and Firestore.
// It exports a DELETE function that processes the request to delete a picture by its ID. 
// source: src/app/api/delete-picture/[id]/route.ts
// It checks if the ID is provided, retrieves the photo document from Firestore, deletes the
import { NextRequest, NextResponse } from 'next/server';
import { bucket } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params since they're now a Promise
    const { id: photoId } = await params;

    if (!photoId) {
      return NextResponse.json(
        { error: 'ID da foto não fornecido' },
        { status: 400 }
      );
    }

    const photoRef = doc(db, 'photos', photoId);
    const photoSnapshot = await getDoc(photoRef);

    if (!photoSnapshot.exists()) {
      return NextResponse.json(
        { error: 'Foto não encontrada' },
        { status: 404 }
      );
    }

    const photoData = photoSnapshot.data();
    const fileUrl = photoData.url;

    const matches = fileUrl.match(/https:\/\/storage.googleapis.com\/[^/]+\/(.+)/);

    if (!matches || matches.length < 2) {
      return NextResponse.json(
        { error: 'URL da foto inválida' },
        { status: 400 }
      );
    }

    const filePath = matches[1];
    const file = bucket.file(filePath);

    await file.delete();
    await deleteDoc(photoRef);

    return NextResponse.json(
      { message: 'Foto excluída com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao excluir foto:', error);
    return NextResponse.json(
      { error: 'Erro interno ao excluir foto' },
      { status: 500 }
    );
  }
}