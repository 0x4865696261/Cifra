#!/usr/bin/env node
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("screenshots", { recursive: true });

const base = process.argv[2] || "http://127.0.0.1:8080";
const fails = [];

function check(name, condition) {
  if (condition) console.log(`PASS ${name}`);
  else {
    console.error(`FAIL ${name}`);
    fails.push(name);
  }
}

async function aparece(locator, ms = 10_000) {
  try {
    await locator.first().waitFor({ state: "visible", timeout: ms });
    return true;
  } catch {
    return false;
  }
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (error) => fails.push(`pageerror: ${error.message}`));

// 1) El tablero: elegir camino y ver los 15 retos.
await page.goto(`${base}/retos`);
check("aparece la entrada con dos caminos", await aparece(page.getByText("¿Cómo empiezas?")));
await page.screenshot({ path: "screenshots/qa-retos-elegir.png", fullPage: false });

await page.getByRole("button", { name: /Desde cero/ }).first().click();
check("aparece el tablero", await aparece(page.getByText("El tablero")));
const enlaces = await page.locator('a[href$="/retos/bucles-dos"], a[href*="/retos/"]:not([href="/retos"])').count();
check(`hay retos en el tablero (${enlaces})`, enlaces >= 15);
await page.screenshot({ path: "screenshots/qa-retos-tablero.png", fullPage: false });

// 2) Resolver un reto: bucles-dos.
await page.goto(`${base}/retos/bucles-dos`);
check("pantalla de reto con el enunciado", await aparece(page.getByText("El enunciado")));
check("la plantilla de partida está", await aparece(page.locator("textarea")));
const editor = page.locator("textarea").first();
const partida = await editor.inputValue();
check("el código de partida trae el hueco", partida.includes("// Escribe tu solución aquí."));
const referencia = partida.replace(
  "  // Escribe tu solución aquí.",
  "  let suma = 0;\n  for (let i = 0; i < numeros.length; i++) {\n    suma = suma + numeros[i];\n  }\n  return suma;",
);
await editor.fill(referencia);
await page.screenshot({ path: "screenshots/qa-reto-editor.png", fullPage: false });
await page.getByRole("button", { name: "Entregar", exact: true }).click();
check("veredicto de pruebas pasadas", await aparece(page.getByText("todas las pruebas pasaron"), 15_000));
check("entra la defensa (0.4.D)", await aparece(page.getByText("Defiende tu solución")));
await page.screenshot({ path: "screenshots/qa-reto-veredicto.png", fullPage: false });

// 3) La defensa: sin modelo disponible, la marca de repaso sigue siendo honesta.
const zonaDefensa = page.locator("section").filter({ hasText: "Defiende tu solución" }).last();
const respuestaDefensa = zonaDefensa.locator("textarea");
check("la defensa tiene sus preguntas", (await respuestaDefensa.count()) > 0);
if ((await respuestaDefensa.count()) > 0) {
  await respuestaDefensa.first().fill(
    "Sumo con un bucle for y un acumulador que empieza en cero; al final devuelvo la suma.",
  );
  await page.getByRole("button", { name: "Enviar la defensa" }).click().catch(() => {});
  await page.waitForTimeout(1200);
  if ((await page.getByRole("button", { name: /Guardar como superado, con repaso/ }).count()) > 0) {
    await page.getByRole("button", { name: /Guardar como superado, con repaso/ }).click();
    await page.waitForTimeout(400);
  }
  check(
    "el estado queda anotado (repaso o superado)",
    (await page.getByText(/Guardado: /).count()) > 0 || (await page.getByText(/ya superado/).count()) > 0,
  );
}
await page.screenshot({ path: "screenshots/qa-reto-defensa.png", fullPage: false });

// 4) La prueba de nivel: tramo 1 correcto → tramo 2.
await page.goto(`${base}/retos`);
await page.waitForTimeout(600);
const tomarla = page.getByRole("button", { name: "Tomar la prueba de nivel" });
if ((await tomarla.count()) > 0) {
  await tomarla.click();
  await page.waitForTimeout(500);
}
check("aparece el tramo 1", await aparece(page.getByText(/Tramo 1 de 8/)));
const editorTramo = page.locator("textarea").first();
await editorTramo.fill(
  'function dobla(n) {\n  // Devuelve n multiplicado por 2.\n  return n * 2;\n}\n\nconsole.log("A:", dobla(7));\nconsole.log("B:", dobla(-3));\ndobla(7);\n',
);
await page.getByRole("button", { name: "Entregar el tramo" }).click();
check("tras pasar el tramo 1 aparece el tramo 2", await aparece(page.getByText(/Tramo 2 de 8/), 15_000));
await page.screenshot({ path: "screenshots/qa-prueba-nivel-tramo2.png", fullPage: false });

// 5) Ajustes: los dos caminos y el progreso exportable.
await page.goto(`${base}/ajustes`);
check("Ajustes pinta la sección de progreso", await aparece(page.getByText("Tu camino en los retos")));
check("el progreso se ve en Ajustes", (await page.getByText(/superado/i).count()) > 0);
await page.screenshot({ path: "screenshots/qa-ajustes-retos.png", fullPage: false });

await browser.close();

if (fails.length > 0) {
  console.error(`SMOKE RETOS: ${fails.length} fallo(s): ${fails.join(" | ")}`);
  process.exit(1);
}
console.log("SMOKE RETOS: todo pasó");
