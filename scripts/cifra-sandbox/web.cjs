const fs = require("node:fs");
const { JSDOM, VirtualConsole } = require("jsdom");

const dom = new JSDOM(fs.readFileSync("index.html", "utf8"), {
  virtualConsole: new VirtualConsole(),
});
const { document } = dom.window;
const style = document.createElement("style");
style.textContent = fs.readFileSync("styles.css", "utf8");
document.head.append(style);
const tarjeta = document.querySelector("article.tarjeta");
const estilos = tarjeta ? dom.window.getComputedStyle(tarjeta) : null;
const comprobaciones = {
  estructura: Boolean(
    tarjeta?.querySelector("h2")?.textContent?.trim() &&
    tarjeta?.querySelector("p")?.textContent?.trim(),
  ),
  color: estilos?.backgroundColor ?? "",
  espaciado: Boolean(
    estilos &&
    [estilos.paddingTop, estilos.paddingRight, estilos.paddingBottom, estilos.paddingLeft].every(
      (lado) => lado === "16px",
    ),
  ),
};
console.log(JSON.stringify(comprobaciones));
dom.window.close();
