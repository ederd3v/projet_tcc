// RF02: botão por produto abre o WhatsApp com mensagem pré-preenchida.
// Corrige o bug registrado no HANDOFF do espelho local: 6 dos 7 botões da
// versão publicada abriam a conversa em branco — aqui a mensagem é sempre
// construída a partir do produto, nunca fica opcional.
//
// O prefixo NEXT_PUBLIC_ é obrigatório: o botão de pedido (BotaoPedir) roda
// no navegador, e o Next.js só leva para lá as variáveis com esse prefixo.
// Sem ele, o botão caía sempre no número fixo, mesmo com outro no .env
// (issue #2, aberta por @max-d3v).
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5547992401430";

/** "5547992401430" → "(47) 9 9240-1430". Sai do mesmo número do link. */
function formatarNumero(numero: string) {
  const ddd = numero.slice(2, 4);
  const resto = numero.slice(4);
  if (resto.length !== 9) return numero; // formato inesperado: mostra como veio
  return `(${ddd}) ${resto[0]} ${resto.slice(1, 5)}-${resto.slice(5)}`;
}

/** Número como aparece na tela. Fonte única — header, hero, contato e rodapé. */
export const WHATSAPP_DISPLAY = formatarNumero(WHATSAPP_NUMBER);

export function whatsappLinkForProduct(nomeProduto: string, preco: number) {
  const precoFormatado = preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const mensagem = `Olá! Vim pelo site e quero pedir: ${nomeProduto} (${precoFormatado}).`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}

export function whatsappLinkGeneric(mensagem = "Olá! Vim pelo site da Maruim.") {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`;
}
