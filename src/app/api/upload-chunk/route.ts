// app/api/upload-chunk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

interface ChunkData {
  chunk: File;
  chunkIndex: number;
  totalChunks: number;
  uploadId: string;
  fileName: string;
  fileType: string;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const chunk = formData.get('chunk') as File;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const uploadId = formData.get('uploadId') as string;
    const fileName = formData.get('fileName') as string;
    const fileType = formData.get('fileType') as string;

    if (!chunk || chunkIndex === undefined || !totalChunks || !uploadId || !fileName) {
      return NextResponse.json({
        success: false,
        error: 'Dados do chunk incompletos'
      }, { status: 400 });
    }

    // Validação de segurança
    if (chunkIndex < 0 || chunkIndex >= totalChunks) {
      return NextResponse.json({
        success: false,
        error: 'Índice de chunk inválido'
      }, { status: 400 });
    }

    // Criar diretório temporário para chunks se não existir
    const tempDir = path.join(process.cwd(), 'temp', 'chunks', uploadId);
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Salvar chunk temporariamente
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    const chunkPath = path.join(tempDir, `chunk_${chunkIndex.toString().padStart(4, '0')}`);
    
    await writeFile(chunkPath, chunkBuffer);

    console.log(`Chunk ${chunkIndex + 1}/${totalChunks} salvo para upload ${uploadId}`);

    return NextResponse.json({
      success: true,
      chunkIndex,
      uploadId,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} recebido com sucesso`
    });

  } catch (error) {
    console.error('Erro ao processar chunk:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao processar chunk'
    }, { status: 500 });
  }
}

// Configuração para aceitar arquivos grandes
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Limite por chunk
    },
  },
};