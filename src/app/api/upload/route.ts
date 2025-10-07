// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { bucket } from '@/lib/firebase-admin';
import { AxiosError } from 'axios';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
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

    // Validar eventId: obrigatório e existente no banco
    const eventIdRaw = formData.get('eventId');
    const eventId = typeof eventIdRaw === 'string' ? eventIdRaw : null;
    if (!eventId) {
      return NextResponse.json({
        error: 'Event ID é obrigatório para enviar fotos.'
      }, { status: 400 });
    }

    // Consultar evento e verificar status
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);

      if (!eventSnap.exists()) {
        return NextResponse.json({
          error: 'Evento não encontrado.'
        }, { status: 404 });
      }

      const eventData = eventSnap.data() as { status?: string };
      const status = (eventData?.status || '').toString().trim().toLowerCase();
      if (status !== 'ativo') {
        // Bloquear upload para eventos inativos
        return NextResponse.json({
          error: 'O prazo para envio de fotos deste evento já expirou. Obrigado por participar!'
        }, { status: 403 });
      }
    } catch (eventError) {
      console.error('Erro ao validar evento:', eventError);
      return NextResponse.json({
        error: 'Erro ao validar evento.'
      }, { status: 500 });
    }

    // Validação de tamanho do arquivo (50MB = 50 * 1024 * 1024 bytes)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxFileSize) {
      return NextResponse.json({
        error: `Arquivo muito grande. Tamanho máximo permitido: 50MB. Tamanho do arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 413 });
    }

    // Validação de tipo de arquivo (apenas imagens)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
      }, { status: 415 });
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
