import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/retos", label: "Retos" },
  { to: "/estudio", label: "Estudio" },
  { to: "/matematicas", label: "Matemáticas" },
  { to: "/biblioteca", label: "Biblioteca" },
  { to: "/lenguajes", label: "Lenguajes" },
  { to: "/ajustes", label: "Ajustes" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const buscador = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const activar = (evento: KeyboardEvent) => {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
        evento.preventDefault();
        buscador.current?.focus();
      }
    };
    window.addEventListener("keydown", activar);
    return () => window.removeEventListener("keydown", activar);
  }, []);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="cifra-fondo min-h-screen text-ink">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:font-mono focus:text-sm focus:text-paper"
      >
        Saltar al contenido
      </a>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[104rem] flex-wrap items-center justify-between gap-2 px-5 py-2">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center font-sans text-2xl font-bold tracking-tight text-copper"
          >
            Cifra
          </Link>
          <form
            className="curso-buscador"
            role="search"
            onSubmit={(evento) => {
              evento.preventDefault();
              const q = new FormData(evento.currentTarget).get("q");
              void navigate({
                to: "/biblioteca",
                search: typeof q === "string" && q.trim() ? { q } : {},
              });
            }}
          >
            <input
              ref={buscador}
              type="search"
              name="q"
              placeholder="Buscar tutoriales…"
              aria-label="Buscar tutoriales"
              aria-keyshortcuts="Control+k Meta+k"
              maxLength={100}
            />
          </form>
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
            <Link
              to="/estudio"
              search={{ modo: "ejecutar" }}
              className="cifra-nav-link inline-flex min-h-11 items-center px-3 text-sm font-semibold text-copper"
            >
              Ejecutar código
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 font-mono text-sm text-muted sm:flex-row sm:justify-between">
          <p>
            Los retos se comprueban con pruebas en un servidor aislado. El análisis local y
            los borradores se quedan en tu navegador.
          </p>
          <p>Cifra 0.9 · Progreso de lectura local</p>
        </div>
      </footer>
    </div>
  );
}
