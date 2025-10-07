// app/api/finalize-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { readFile, readdir, unlink, rmdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { bucket } from '@/lib/firebase-admin';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface FinalizeRequest {
  uploadId: string;
  fileName: string;
  fileType: string;
  totalSize: number;
  eventId?: string;
  userName?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: FinalizeRequest = await req.json();
    const { uploadId, fileName, fileType, totalSize, eventId, userName } = body;

    if (!uploadId || !fileName || !fileType) {
      return NextResponse.json({
        success: false,
        error: 'Dados de finalização incompletos'
      }, { status: 400 });
    }

    // Validar eventId obrigatório para finalizar upload
    if (!eventId) {
      return NextResponse.json({
        success: false,
        error: 'Event ID é obrigatório.'
      }, { status: 400 });
    }

    // Validar evento e status
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      if (!eventSnap.exists()) {
        return NextResponse.json({
          success: false,
          error: 'Evento não encontrado.'
        }, { status: 404 });
      }
      const status = (eventSnap.data()?.status || '').toString().trim().toLowerCase();
      if (status !== 'ativo') {
        return NextResponse.json({
          success: false,
          error: 'O prazo para envio de fotos deste evento já expirou. Obrigado por participar!'
        }, { status: 403 });
      }
    } catch (validationError) {
      console.error('Erro ao validar evento na finalização:', validationError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao validar evento.'
      }, { status: 500 });
    }

    // Validação de tamanho e tipo do arquivo (consistente com upload normal)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (totalSize > maxFileSize) {
      return NextResponse.json({
        success: false,
        error: `Arquivo muito grande. Tamanho máximo permitido: 50MB. Tamanho do arquivo: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`
      }, { status: 413 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({
        success: false,
        error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedTypes.join(', ')}`
      }, { status: 415 });
    }

    // Verificar se o diretório de chunks existe
    const tempDir = path.join(process.cwd(), 'temp', 'chunks', uploadId);
    if (!existsSync(tempDir)) {
      return NextResponse.json({
        success: false,
        error: 'Upload não encontrado ou expirado'
      }, { status: 404 });
    }

    try {
      // Listar e ordenar chunks
      const chunkFiles = await readdir(tempDir);
      const sortedChunks = chunkFiles
        .filter(file => file.startsWith('chunk_'))
        .sort((a, b) => {
          const indexA = parseInt(a.replace('chunk_', ''));
          const indexB = parseInt(b.replace('chunk_', ''));
          return indexA - indexB;
        });

      if (sortedChunks.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Nenhum chunk encontrado'
        }, { status: 400 });
      }

      // Combinar chunks em um buffer
      const buffers: Buffer[] = [];
      let totalReadSize = 0;

      for (const chunkFile of sortedChunks) {
        const chunkPath = path.join(tempDir, chunkFile);
        const chunkBuffer = await readFile(chunkPath);
        buffers.push(chunkBuffer);
        totalReadSize += chunkBuffer.length;
      }

      // Verificar se o tamanho total confere
      if (Math.abs(totalReadSize - totalSize) > 1024) { // Tolerância de 1KB
        console.warn(`Tamanho divergente: esperado ${totalSize}, obtido ${totalReadSize}`);
      }

      // Combinar todos os buffers
      const finalBuffer = Buffer.concat(buffers);

      // Upload para Firebase Storage
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storageFileName = `uploads/${Date.now()}_${sanitizedFileName}`;
      const fileUpload = bucket.file(storageFileName);

      await fileUpload.save(finalBuffer, {
        metadata: {
          contentType: fileType,
          metadata: {
            originalName: fileName,
            uploadId: uploadId,
            uploadMethod: 'chunked',
            totalSize: totalSize.toString()
          }
        },
        public: true,
      });

      // Tornar o arquivo público
      await fileUpload.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storageFileName}`;

      // Salvar no Firestore
      const photosCollection = collection(db, 'photos');
      await addDoc(photosCollection, {
        eventId: eventId || null,
        userName: userName || 'Anônimo',
        name: fileName,
        url: publicUrl,
        size: totalSize,
        uploadMethod: 'chunked',
        createdAt: serverTimestamp(),
      });

      // Limpar arquivos temporários
      try {
        for (const chunkFile of sortedChunks) {
          const chunkPath = path.join(tempDir, chunkFile);
          await unlink(chunkPath);
        }
        await rmdir(tempDir);
        
        // Tentar remover diretório pai se estiver vazio
        const parentDir = path.dirname(tempDir);
        try {
          await rmdir(parentDir);
        } catch {
          // Ignorar erro se diretório não estiver vazio
        }
      } catch (cleanupError) {
        console.warn('Erro ao limpar arquivos temporários:', cleanupError);
        // Não falhar o upload por causa da limpeza
      }

      console.log(`Upload finalizado com sucesso: ${publicUrl}`);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: storageFileName,
        size: totalSize,
        message: 'Upload em chunks finalizado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao processar chunks:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao processar chunks do arquivo'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao finalizar upload:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao finalizar upload'
    }, { status: 500 });
  }
}