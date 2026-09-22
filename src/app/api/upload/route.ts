import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// RF07 / RFC 6.5: upload de foto de produto pro Amazon S3. Quem chama pede
// uma URL presignada aqui e envia o arquivo direto pro S3 — ele nunca passa
// pelo servidor Next.js.
//
// ⚠️ Hoje nenhuma tela chama esta rota. Ela servia à tela de produtos em
// React, removida quando o painel virou o CRM do projeto. Está mantida de
// propósito: o painel ainda não tem envio de foto, e quando tiver é aqui que
// ele bate. Enquanto o S3 não estiver provisionado, responde 501 com uma
// explicação em vez de falhar em silêncio.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json(
      { error: "S3 não configurado ainda (S3_BUCKET_NAME vazio). Cole uma URL de imagem manualmente." },
      { status: 501 }
    );
  }

  const { fileName, contentType } = await req.json();
  if (!fileName || !contentType) {
    return NextResponse.json({ error: "fileName e contentType são obrigatórios" }, { status: 400 });
  }

  const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
  const key = `produtos/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl });
}
