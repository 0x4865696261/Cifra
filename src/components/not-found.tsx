import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main id="contenido" className="mx-auto flex min-h-[60vh] max-w-2xl flex-col justify-center px-5 py-16">
      <p className="font-mono text-sm text-copper">404</p>
      <h1 className="mt-3 font-serif text-4xl">Esta página no está.</h1>
      <p className="mt-4 text-pretty">
        No es un apartado a medio hacer. Esa dirección no forma parte de Cifra.
      </p>
      <Link to="/" className="mt-8 inline-flex min-h-11 items-center font-mono text-sm text-copper">
        Volver al inicio
      </Link>
    </main>
  );
}
