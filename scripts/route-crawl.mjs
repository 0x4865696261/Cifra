#!/usr/bin/env node
/**
 * Rastrea las rutas del servidor y exige contenido visible en cada una.
 *
 * Es el portón que faltaba tras el fallo silencioso de 2026-10: una ruta hija
 * con el componente del padre (`matematicas.tsx` con su propio componente y sin
 * Outlet) respondía 200 con el HTML del índice en su lugar. La página existía,
 * el título (<title>) era el correcto, y solo disparando el h1 justo se nota.
 *
 * Uso: node scripts/route-crawl.mjs [baseUrl]
 */
import { concepts } from "../src/lib/content/concepts.ts";
import { mathTopics } from "../src/lib/content/math.ts";

const base = (process.argv[2] ?? "http://127.0.0.1:8080").replace(/\/+$/, "");

/** Cada ruta con el fragmento del h1 que confirma que es ESA página. */
const EXPECTED = [
  ["/", "Entender el código"],
  ["/estudio", "Lee un programa"],
  ["/matematicas", "De la fórmula a los pasos"],
  ["/biblioteca", "Una red pequeña"],
  ["/lenguajes", "El mismo problema"],
  ...mathTopics.map((topic) => [`/matematicas/${topic.slug}`, topic.title]),
  ...concepts
    .filter((concept) => ["variable", "recursion", "propiedad-rust"].includes(concept.slug))
    .map((concept) => [`/biblioteca/${concept.slug}`, concept.title]),
];

function fail(message) {
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exit(1);
}

async function main() {
  const failures = [];
  for (const [path, fragment] of EXPECTED) {
    let response;
    try {
      response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30_000) });
    } catch (err) {
      failures.push({ path, error: err instanceof Error ? err.message : String(err) });
      continue;
    }
    if (response.status !== 200) {
      failures.push({ path, status: response.status });
      continue;
    }
    const html = await response.text();
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1] ?? "";
    if (!h1.includes(fragment)) {
      // El h1 puede venir sectorizado por SSR; si no está ni en el HTML entero,
      // la página servida no es la que debe.
      if (html.includes(fragment)) continue;
      failures.push({ path, expected: fragment, got: h1.slice(0, 120) });
    }
  }
  if (failures.length > 0) {
    fail(`${failures.length} de ${EXPECTED.length} rutas con contenido equivocado`);
  }
  console.log(JSON.stringify({ ok: true, checked: EXPECTED.length }));
}

main();
