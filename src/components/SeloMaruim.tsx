// Selo "B M" da marca (logo do professor, a partir do PDF "logotipo fundo preto
// maruim 2"). É desenhado como máscara: a cor vem de `text-*`, então acompanha
// o tema claro/escuro sem precisar de duas versões do arquivo.
export function SeloMaruim({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Bebidas Maruim"
      className={`block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: "url(/brand/selo-bm.png)",
        maskImage: "url(/brand/selo-bm.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

// Logo completa (inseto + BEBIDAS MARUIM), mesma técnica de máscara.
export function LogoMaruim({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Bebidas Maruim"
      className={`block shrink-0 bg-current ${className}`}
      style={{
        WebkitMaskImage: "url(/brand/logo-maruim.png)",
        maskImage: "url(/brand/logo-maruim.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
