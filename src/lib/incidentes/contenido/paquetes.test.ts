/**
 * Las pruebas de los paquetes de incidente (0.5.A/F/G): 8 paquetes, uno por familia del mínimo
 * de las notas de la versión. Cada uno lleva su análisis de ejemplo correcto evaluado como
 * acertado por la comparación local (0.5.D), su evidencia esperada citable con la terminal y
 * ninguna credencial real (comprobación automática de patrones).
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { getConcept } from "../../content/concepts.ts";
import { creaSistema } from "../sistema.ts";
import { evaluar } from "../evaluar.ts";
import { definicionesIncidentes } from "../paquetes.ts";
import { familiasIncidente } from "../tipos.ts";

const FAMILIAS_MINIMO = new Set([
  "valor-nulo",
  "estado-corrupto",
  "secreto-expuesto",
  "permiso-de-mas",
  "consulta-lenta",
  "bloqueo-espera",
  "desborde-recursos",
  "discrepancia-mensaje",
]);

test("los paquetes son 8, uno por familia del mínimo acordado, con niveles variados", () => {
  assert.equal(definicionesIncidentes.length, 8);
  const familias = new Set(definicionesIncidentes.map((p) => p.familia));
  assert.deepEqual(familias, FAMILIAS_MINIMO);
  for (const paquete of definicionesIncidentes) {
    assert.ok(familiasIncidente.includes(paquete.familia as never), paquete.familia);
    assert.ok(paquete.nivel >= 1 && paquete.nivel <= 10, `${paquete.id}: nivel fuera de rango`);
    assert.ok(paquete.titulo.trim().length > 0, paquete.id);
    assert.ok(paquete.sintoma.trim().length > 0, paquete.id);
    assert.ok(paquete.notaFamilia.trim().length > 0, paquete.id);
  }
  const niveles = new Set(definicionesIncidentes.map((p) => p.nivel));
  assert.ok(niveles.size >= 5, "niveles demasiado iguales para llamarse mixtos");
});

test("los ids no se repiten y los conceptos existen en la biblioteca", () => {
  const ids = new Set<string>();
  for (const paquete of definicionesIncidentes) {
    assert.ok(!ids.has(paquete.id), `${paquete.id}: id repetido`);
    ids.add(paquete.id);
    assert.ok(paquete.conceptos.length > 0, `${paquete.id}: sin conceptos`);
    for (const slug of paquete.conceptos) {
      assert.ok(getConcept(slug), `${paquete.id}: el concepto ${slug} no está en la biblioteca`);
    }
  }
});

test("cada punto de la evidencia esperada se puede citar contra los ficheros del paquete", () => {
  for (const paquete of definicionesIncidentes) {
    const sistema = creaSistema(paquete.ficheros);
    for (const punto of paquete.respuestaEsperada.evidencia) {
      const corte = punto.includes(":") ? punto.indexOf(":") : punto.length;
      const ruta = punto.slice(0, corte);
      const cadena = corte < punto.length ? punto.slice(corte + 1) : null;
      const encontrada = sistema.ficheros.get(`/${ruta}`);
      assert.ok(encontrada !== undefined, `${paquete.id}: la ruta ${ruta} no está en el paquete`);
      if (cadena) {
        const presente = encontrada
          .split("\n")
          .some((linea) => linea.trim().length > 0 && linea.includes(cadena.trim()));
        assert.ok(presente, `${paquete.id}: la cadena de ${punto} no aparece en el fichero`);
      }
    }
    // y el análisis de ejemplo cita rutas que existen
    for (const cita of paquete.analizoEstandar.evidencia) {
      assert.ok(
        sistema.ficheros.has(`/${cita.ruta}`),
        `${paquete.id}: la cita ${cita.ruta} no está en el paquete`,
      );
    }
  }
});

test("el análisis de ejemplo correcto de cada paquete se evalúa como acertado", () => {
  for (const paquete of definicionesIncidentes) {
    const juicio = evaluar(paquete, paquete.analizoEstandar);
    for (const campo of ["causa", "impacto", "correccion", "comoDetectarlo"] as const) {
      assert.equal(juicio.campos[campo], "acertado", `${paquete.id} / ${campo}`);
    }
    for (const evidencia of juicio.evidencia) {
      assert.equal(evidencia.estado, "sostenida", `${paquete.id}: ${evidencia.detalle}`);
    }
    assert.deepEqual(juicio.pasadoPorAlto, [], paquete.id);
  }
});

test("una causa que solo suena plausible y sin citas no da por bueno el análisis", () => {
  for (const paquete of definicionesIncidentes) {
    const juicio = evaluar(paquete, { ...paquete.analizoEstandar, evidencia: [] });
    for (const campo of ["causa", "impacto", "correccion", "comoDetectarlo"] as const) {
      assert.equal(juicio.campos[campo], "deducido-sin-evidencia", `${paquete.id} / ${campo}`);
    }
  }
});

test("ningún paquete lleva credenciales reales, direcciones reales ni dominios del mundo", () => {
  const DOMINIOS = [
    "openai.com",
    "anthropic.com",
    "x.ai",
    "googleapis.com",
    "amazonaws.com",
    "gmail.com",
    "outlook.com",
    "hotmail.com",
    "facebook.com",
    "twitter.com",
  ];
  const PATRON_CLAVE = /sk-[a-z0-9-]{10,}|AKIA[A-Z0-9]{10,}|ghp_[A-Za-z0-9]{15,}|eyJ[A-Za-z0-9_-]{15,}/g;
  const PATRON_URL_CON_CLAVE = /(?:postgres(?:ql)?|mysql):\/\/[^@\s]+:[^@\s]+@/g;
  for (const paquete of definicionesIncidentes) {
    for (const [ruta, contenido] of Object.entries(paquete.ficheros)) {
      for (const dominio of DOMINIOS) {
        assert.ok(
          !contenido.includes(dominio),
          `${paquete.id}/${ruta}: dirección real ${dominio}`,
        );
      }
      for (const clave of contenido.match(PATRON_CLAVE) ?? []) {
        assert.match(clave, /sinteti/i, `${paquete.id}/${ruta}: clave sin marca sintética`);
      }
      const conClave = contenido.match(PATRON_URL_CON_CLAVE) ?? [];
      for (const url of conClave) {
        assert.match(url, /sinteti/i, `${paquete.id}/${ruta}: URL con credencial sin marca`);
      }
    }
  }
});
