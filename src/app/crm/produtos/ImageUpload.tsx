"use client";

import { useState } from "react";

// RF07: upload de foto de produto. Se o S3 ainda não estiver configurado
// (S3_BUCKET_NAME vazio no .env), o campo de URL abaixo fica editável na mão
// — assim o CRUD funciona por completo mesmo antes de provisionar a AWS.
export function ImageUpload({ defaultValue = "" }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error ?? "Falha ao gerar URL de upload");
        return;
      }
      await fetch(data.uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setUrl(data.publicUrl);
    } catch {
      setErro("Falha no upload — cole a URL da imagem manualmente abaixo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleFile} disabled={enviando} className="text-sm text-maruim-cream" />
      {enviando && <p className="text-xs text-maruim-muted">Enviando...</p>}
      {erro && <p className="text-xs text-amber-400">{erro}</p>}
      <input
        name="fotoUrl"
        placeholder="/products/exemplo.png ou URL do S3"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="w-full rounded-md border border-maruim-amber/30 bg-maruim-bg px-3 py-2 text-sm text-maruim-cream"
      />
    </div>
  );
}
