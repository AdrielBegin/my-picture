// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bucket } from '@/lib/firebase-admin';
import { AxiosError } from 'axios';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    console.log('Bucket configurado:', bucket.name);

    if (!file || !(file instanceof File)) {
      return NextResponse.json({
        error: 'Nenhum arquivo enviado ou formato inválido.'
      }, { status: 400 });
    }

    // Verificar se o bucket existe
    try {
      await bucket.getMetadata();
    } catch (bucketError) {
      console.error('Erro do bucket:', bucketError);
      return NextResponse.json({
        error: 'Bucket de storage não encontrado. Verifique a configuração do Firebase Storage.'
      }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `uploads/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileUpload = bucket.file(fileName);

    // Upload do arquivo
    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type || 'application/octet-stream',
      },
      public: true,
    });

    // Tornar o arquivo público
    await fileUpload.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    const photosCollection = collection(db, 'photos');
    await addDoc(photosCollection, {
      eventId: formData.get('eventId') || null,
      userName: formData.get('userName') || 'Anônimo',
      name: file.name,
      url: publicUrl,
      createdAt: serverTimestamp(), // Melhor que new Date() para consistência no Firestore
    });

    return NextResponse.json({
      message: 'Upload feito com sucesso!',
      url: publicUrl,
      fileName: fileName
    });

  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error('Erro detalhado no upload:', {
        message: error.message,
        code: error.code,
        details: error.response?.data
      });
    } else {
      console.error('Erro inesperado no upload:', error);
    }
  }

  return NextResponse.json({
    error: 'Erro interno no upload.',
    details: "Ocorreu um erro ao processar o upload. Por favor, tente novamente mais tarde."
  }, { status: 500 });
}
