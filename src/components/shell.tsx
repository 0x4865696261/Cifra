import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const links = [
  { to: "/retos", label: "Retos" },
  { to: "/estudio", label: "Estudio" },
  { to: "/matematicas", label: "Matemáticas" },
  { to: "/biblioteca", label: "Biblioteca" },
  { to: "/lenguajes", label: "Lenguajes" },
  { to: "/ajustes", label: "Ajustes" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-paper"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex max-w-[104rem] flex-wrap items-center justify-between gap-2 px-5 py-2">
          <Link to="/" className="inline-flex min-h-11 items-center font-sans text-2xl font-bold tracking-tight text-copper">
            Cifra
          </Link>
          <nav className="flex flex-wrap" aria-label="Secciones">
            {links.map((link) => {
              const active = pathname === link.to || pathname.startsWith(`${link.to}/`);
              return (
                <Link
                  key={link.to}
                  aria-current={active ? "page" : undefined}
                  to={link.to}
                  className={cn(
                    "cifra-nav-link inline-flex min-h-11 items-center px-3 text-sm font-semibold",
                    active ? "text-ink" : "text-muted",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link to="/estudio" search={{ modo: "ejecutar" }} className="cifra-nav-link inline-flex min-h-11 items-center px-3 text-sm font-semibold text-copper">
              Ejecutar código
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 font-mono text-sm text-muted sm:flex-row sm:justify-between">
          <p>
            El código corre en tu navegador: aislado, con límites y sin salir a la red. Los
            veredictos de los retos salen de ahí, no de un modelo.
          </p>
          <p>La lectura recordada se queda en este navegador.</p>
        </div>
      </footer>
    </div>
  );
}
