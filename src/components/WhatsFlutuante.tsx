"use client";

import { useEffect, useState } from "react";
import { whatsappLinkGeneric } from "@/lib/whatsapp";
import { IconeWhatsApp } from "./IconeWhatsApp";

// Atalho de pedido sempre à mão (como na vitrine de perfumes): aparece depois
// que a pessoa passa da primeira tela e fica no canto em todas as páginas
// públicas (é renderizado pelo Footer, que o CRM não usa).
export function WhatsFlutuante() {
  const [mostrar, setMostrar] = useState(false);
  useEffect(() => {
    const ver = () => setMostrar(window.scrollY > window.innerHeight * 0.6);
    ver();
    window.addEventListener("scroll", ver, { passive: true });
    return () => window.removeEventListener("scroll", ver);
  }, []);

  return (
    <a
      href={whatsappLinkGeneric()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Pedir pelo WhatsApp"
      className={`group fixed bottom-5 right-5 z-40 flex items-center gap-3 transition-all duration-500 md:bottom-8 md:right-8 ${
        mostrar ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="hidden rounded-full bg-white px-4 py-2 text-sm text-neutral-900 shadow-lg transition-opacity md:block md:opacity-0 md:group-hover:opacity-100">
        Peça pelo WhatsApp
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-[#0b1f14] shadow-xl shadow-black/30">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30 [animation-duration:2.4s]" />
        <IconeWhatsApp className="relative h-7 w-7" />
      </span>
    </a>
  );
}
