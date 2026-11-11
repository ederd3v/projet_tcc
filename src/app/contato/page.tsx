import { redirect } from "next/navigation";

// O contato agora fica no fim da página Sobre. Quem tiver o link antigo
// (/contato) cai direto na seção certa.
export default function ContatoPage() {
  redirect("/sobre#contato");
}
