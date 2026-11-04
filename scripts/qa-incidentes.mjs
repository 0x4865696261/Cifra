#!/usr/bin/env node
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

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

// Fichero de importación válido: progreso de retos con el profesional desbloqueado
// (mismo trámite que haría una persona exportando en otro navegador e importándolo aquí).
const ficheroProgreso = join(tmpdir(), "cifra-qa-progreso.json");
writeFileSync(
  ficheroProgreso,
  JSON.stringify({
    version: 1,
    plan: null,
    retos: {},
    pruebaNivel: null,
    profesionalDesbloqueado: true,
    conceptosRepaso: [],
  }),
);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on("pageerror", (error) => fails.push(`pageerror: ${error.message}`));
page.on("console", (mensaje) => {
  if (mensaje.type() === "error") fails.push(`console: ${mensaje.text()}`);
});

// 1) El tablero sin plan profesional: los paquetes se explican, no se abren.
await page.goto(`${base}/incidentes`);
await page.waitForTimeout(600);
check("el tablero explica la puerta del profesional", await aparece(page.getByText("El camino profesional")));
check("sin plan no hay lista de paquetes", (await page.locator('a[href*="/incidentes/"]').count()) === 0);
await page.screenshot({ path: "screenshots/qa-incidentes-tablero-puerta.png", fullPage: true });

// 2) La pantalla de incidente sin plan: explica cómo se abre, sin botones vacíos.
await page.goto(`${base}/incidentes/perfil-500-madrugada`);
check("la pantalla pide el camino profesional", await aparece(page.getByText("Este paquete pide el camino profesional")));
check("sin plan no hay terminal", (await page.locator('input[placeholder="ls logs"]').count()) === 0);
await page.screenshot({ path: "screenshots/qa-incidentes-puerta.png", fullPage: true });

// 3) Ajustes: con el desbloqueo importado, se activa el plan profesional.
await page.goto(`${base}/ajustes`);
await page.waitForTimeout(600);
check("Ajustes pinta la nueva sección de incidentes", await aparece(page.getByText("Tu progreso en los incidentes")));
await page.locator('label:has-text("Importar un fichero…") input[type="file"]').first().setInputFiles(ficheroProgreso);
check("la importación de retos entra", await aparece(page.getByText("Progreso importado"), 10_000));
await page.getByRole("button", { name: "Profesional", exact: true }).click();
check("el plan queda activo", await aparece(page.getByText(/Camino cambiado a profesional/), 10_000));
await page.screenshot({ path: "screenshots/qa-incidentes-ajustes.png", fullPage: true });

// 4) El tablero con el plan activo: las 8 familias listadas con su progreso.
await page.goto(`${base}/incidentes`);
await page.waitForTimeout(600);
check("el tablero lista los paquetes (Entregados 0/8)", await aparece(page.getByText("Entregados: 0/8")));
for (const familia of ["Valores nulos", "Secretos expuestos", "Consultas lentas"]) {
  check(`familia visible: ${familia}`, await aparece(page.getByText(familia)));
}
await page.screenshot({ path: "screenshots/qa-incidentes-tablero.png", fullPage: true });

// 5) La pantalla de incidente con el plan activo: terminal y análisis de punta a punta.
await page.goto(`${base}/incidentes/perfil-500-madrugada`);
check("el síntoma aparece", await aparece(page.getByText(/la pantalla de perfil devuelve 500/)));
const terminal = page.locator('input[placeholder="ls logs"]');
await terminal.fill("ls");
await page.getByRole("button", { name: "Ejecutar" }).click();
check("ls responde con las carpetas del paquete", await aparece(page.getByText("logs/"), 10_000));
await terminal.fill("grep ERROR logs/app.log");
await page.getByRole("button", { name: "Ejecutar" }).click();
check("grep responde con el ERROR citable", await aparece(page.getByText(/no se puede leer la propiedad .ciudad./), 10_000));
await page.screenshot({ path: "screenshots/qa-incidentes-terminal.png", fullPage: true });

await page.getByLabel("Qué pasó").fill(
  "la limpieza de medianoche borra direcciones sin validar y el perfil lee la ciudad de una dirección que ya no existe",
);
await page.getByLabel("Ruta").nth(0).fill("logs/app.log");
await page.getByLabel("Qué dice ahí").nth(0).fill(
  "03:07:12 ERROR TypeError: no se puede leer la propiedad 'ciudad' de null (app/perfil.js:5)",
);
await page.getByRole("button", { name: "Añadir otra cita" }).click();
await page.getByLabel("Ruta").nth(1).fill("jobs/limpieza.sql");
await page.getByLabel("Qué dice ahí").nth(1).fill("delete from direcciones where validada = false;");
await page.getByLabel("Impacto").fill(
  "la pantalla de perfil devuelve 500 para cada cuenta cuya dirección no pasó la validación",
);
await page.getByLabel("Corrección").fill(
  "mirar si la dirección existe antes de leer la ciudad y responder un valor por defecto",
);
await page.getByLabel("Cómo se habría detectado antes").fill(
  "una prueba con un usuario cuyo registro no lleva dirección",
);
check("el botón de entrega se activa", await aparece(page.locator('button:has-text("Entregar el análisis"):not([disabled])')));
await page.getByRole("button", { name: "Entregar el análisis" }).click();
check("la comparación sale campo por campo", await aparece(page.getByText("La comparación, campo por campo"), 15_000));
const acertado = await page.getByText("acertado", { exact: true }).count();
check(`hay marcas acertadas (${acertado})`, acertado >= 2);
await page.screenshot({ path: "screenshots/qa-incidentes-comparacion.png", fullPage: true });

// 6) Ajustes recuerda la entrega, y el tablero suma.
await page.goto(`${base}/ajustes`);
await page.waitForTimeout(600);
check("Ajustes ve un paquete entregado", await aparece(page.getByText(/entregados:\s*un paquete/)));
await page.screenshot({ path: "screenshots/qa-incidentes-ajustes-tras-entrega.png", fullPage: true });
await page.goto(`${base}/incidentes`);
await page.waitForTimeout(600);
check("el tablero suma la entrega (1/8)", await aparece(page.getByText("Entregados: 1/8")));

// 7) Móvil: el tablero y la pantalla de incidente caben en 390 px sin romper.
const contextoMovil = await browser.newContext({
  viewport: { width: 390, height: 844 },
  storageState: await page.context().storageState(),
});
const movil = await contextoMovil.newPage();
movil.on("pageerror", (error) => fails.push(`pageerror móvil: ${error.message}`));
await movil.goto(`${base}/incidentes`);
await movil.waitForTimeout(800);
await movil.screenshot({ path: "screenshots/qa-incidentes-movil.png", fullPage: true });
await movil.goto(`${base}/incidentes/perfil-500-madrugada`);
await movil.waitForTimeout(800);
check("en móvil la terminal está", await aparece(movil.locator('input[placeholder="ls logs"]')));
await movil.screenshot({ path: "screenshots/qa-incidentes-movil-incidente.png", fullPage: true });
await movil.close();
await contextoMovil.close();

rmSync(ficheroProgreso, { force: true });
await browser.close();

if (fails.length > 0) {
  console.error(`SMOKE INCIDENTES: ${fails.length} fallo(s): ${fails.join(" | ")}`);
  process.exit(1);
}
console.log("SMOKE INCIDENTES: todo pasó");
