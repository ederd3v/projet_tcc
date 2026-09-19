// RF02: botão por produto abre o WhatsApp com mensagem pré-preenchida.
// Corrige o bug registrado no HANDOFF do espelho local: 6 dos 7 botões da
// versão publicada abriam a conversa em branco — aqui a mensagem é sempre
// construída a partir do produto, nunca fica opcional.
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ?? "5547992401430";

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
