import { Link } from "@tanstack/react-router";
import { BookOpen, Braces, Calculator, Code2, Layers3, Route } from "lucide-react";

const rutas = [
  {
    titulo: "Empieza desde cero",
    texto: "Variables, funciones y bucles",
    to: "/biblioteca",
    icono: BookOpen,
    color: "azul",
  },
  {
    titulo: "Retos de programación",
    texto: "Ejercicios con pruebas reales",
    to: "/retos",
    icono: Braces,
    color: "verde",
  },
  {
    titulo: "Estudio de código",
    texto: "Lectura, depuración y comparación",
    to: "/estudio",
    icono: Code2,
    color: "violeta",
  },
  {
    titulo: "Matemáticas aplicadas",
    texto: "De las fórmulas al código",
    to: "/matematicas",
    icono: Calculator,
    color: "naranja",
  },
] as const;

export function PortadaCursos() {
  return (
    <>
      <header className="curso-hero">
        <p>Aprende a programar con</p>
        <h1>Tutoriales de Cifra</h1>
        <p>Del primer programa a los proyectos de varios archivos</p>
      </header>
      <p className="curso-intro">
        Explora tutoriales, practica con retos y ejecuta tus soluciones en el navegador. Cada
        itinerario conecta explicaciones, ejemplos editables y ejercicios.
      </p>
      <nav className="curso-atajos" aria-label="Accesos rápidos">
        <a href="#itinerarios" className="curso-tarjeta">
          <Route aria-hidden="true" />
          Desde cero
        </a>
        <Link to="/biblioteca" className="curso-tarjeta">
          <BookOpen aria-hidden="true" />
          Biblioteca
        </Link>
        <Link to="/lenguajes" className="curso-tarjeta">
          <Layers3 aria-hidden="true" />
          Ejemplos
        </Link>
        <Link to="/retos" className="curso-tarjeta">
          <Braces aria-hidden="true" />
          Retos
        </Link>
        <Link to="/estudio" search={{ modo: "ejecutar" }} className="curso-tarjeta">
          <Code2 aria-hidden="true" />
          Abrir el editor
        </Link>
      </nav>
      <section className="curso-seccion" id="itinerarios">
        <h2>Cursos e itinerarios</h2>
        <div className="curso-itinerarios">
          {rutas.map(({ titulo, texto, to, icono: Icono, color }) => (
            <Link key={to} to={to} className="curso-tarjeta">
              <span className={`curso-icono curso-icono--${color}`}>
                <Icono size={35} aria-hidden="true" />
              </span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
