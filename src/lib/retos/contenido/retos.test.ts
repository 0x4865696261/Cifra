import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { correrPruebasPorTransporte, todasPasadas } from "../../ejecucion/pruebas.ts";
import { liberarHilos, transporteHilo } from "../../ejecucion/hiloPrueba.ts";
import { limitesDefecto } from "../../ejecucion/limites.ts";
import type { RunRequest } from "../../ejecucion/tipos.ts";
import { definiciones, instanciaReto } from "../retos.ts";
import type { InstanciaReto } from "../tipos.ts";
import type { RetoCompleto } from "./utiles.ts";
import type { DatosReto } from "../tipos.ts";

/**
 * La prueba del contenido (0.4.B): cada reto del mínimo de la versión se corre de verdad en un
 * hilo de Node con la MISMA fuente que la web usa. La solución de referencia tiene que superar
 * todas sus pruebas y la «casi correcta más típica» tiene que caer en al menos una: eso es lo
 * que hace que las pruebas de un reto enseñen a mirar los límites.
 */

after(() => liberarHilos());

const persona = "persona-contenido-0001";

function pedido(codigo: string, pruebas: InstanciaReto["pruebas"]): RunRequest {
  return { lenguaje: "javascript", codigo, limites: limitesDefecto(), pruebas };
}

async function entregar(reto: RetoCompleto, datos: DatosReto, cual: "referencia" | "casi") {
  const codigo = cual === "referencia" ? reto.solucionReferencia(datos) : reto.solucionCasi(datos);
  const pruebas = reto.fabrica(datos).pruebas;
  return await correrPruebasPorTransporte(transporteHilo(), pedido(codigo, pruebas));
}

describe("el contenido de la 0.4: cinco familias × tres niveles", () => {
  it("hay 15 retos con 5 familias y niveles 2, 5 y 8, bien escritos", () => {
    assert.equal(definiciones.length, 15);
    assert.deepEqual(
      new Set(definiciones.map((reto) => reto.familia)),
      new Set(["bucles", "condicionales", "funciones", "colecciones", "cadenas"]),
    );
    for (const reto of definiciones) {
      assert.ok(reto.nivel >= 1 && reto.nivel <= 10, `${reto.id}: nivel fuera de rango`);
      assert.ok(reto.conceptos.length > 0, `${reto.id}: sin conceptos de la biblioteca`);
      assert.ok(reto.preguntasDefensa.length >= 2, `${reto.id}: faltan preguntas de defensa`);
      for (const pregunta of reto.preguntasDefensa) {
        assert.ok(pregunta.trim().length > 0, `${reto.id}: pregunta de defensa vacía`);
      }
    }
  });

  it("la misma persona recibe la misma instancia y otra persona, variante distinta", () => {
    let distintos = 0;
    for (const reto of definiciones) {
      const deAna = instanciaReto(reto, persona);
      const deAnaOtraVez = instanciaReto(reto, persona);
      const deLuis = instanciaReto(reto, "persona-contenido-0002");
      assert.deepEqual(deAna, deAnaOtraVez);
      if (JSON.stringify(deAna.datos) !== JSON.stringify(deLuis.datos)) distintos += 1;
      assert.equal(deAna.generador?.semilla, "por-persona");
      assert.deepEqual(deAna.lenguajes, ["javascript"]);
      assert.ok(deAna.enunciado.length > 40, `${reto.id}: enunciado demasiado corto`);
      assert.ok(deAna.codigoDePartida.includes("// Escribe tu solución"), `${reto.id}: sin hueco para escribir`);
    }
    // El desbloqueo de variantes es un mecanismo de plataforma: la gran mayoría de retos
    // tienen datos personales distintos, y los que tienen espacio pequeño no prometen más
    // de lo que dan.
    assert.ok(distintos >= 10, `solo ${distintos} de ${definiciones.length} retos variaron por persona`);
  });
});

for (const reto of definiciones) {
  describe(`reto ${reto.id} (nivel ${reto.nivel})`, () => {
    it("la solución de referencia lo supera entero", { timeout: 120_000 }, async () => {
      const datos = instanciaReto(reto, persona).datos;
      const resultado = await entregar(reto, datos, "referencia");
      assert.equal(resultado.estado, "ok", `${reto.id}: ${resultado.stderr.slice(0, 300)}`);
      assert.equal(
        todasPasadas(resultado),
        true,
        `${reto.id}: la referencia no supera sus propias pruebas: ${JSON.stringify(resultado.pruebas)}`,
      );
    });

    it("la «casi correcta más típica» cae en al menos una prueba", { timeout: 120_000 }, async () => {
      const datos = instanciaReto(reto, persona).datos;
      const resultado = await entregar(reto, datos, "casi");
      assert.notEqual(
        todasPasadas(resultado),
        true,
        `${reto.id}: la casi correcta pasa todo; las pruebas no enseñan el límite que toca mirar`,
      );
    });
  });
}
