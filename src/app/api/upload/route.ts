import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// RF07 / RFC 6.5: upload de foto de produto pro Amazon S3. O CRM (client)
// pede uma URL presignada aqui e faz o PUT direto pro S3 — o arquivo nunca
// passa pelo servidor Next.js.
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
