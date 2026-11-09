import { useEffect, useState } from "react";

function htmlEstatico(html: string): string {
  // El contenido de un template es inerte mientras se eliminan los elementos
  // y atributos con capacidad de cargar recursos, navegar o ejecutar código.
  const plantilla = document.createElement("template");
  plantilla.innerHTML = html;
  for (const nodo of plantilla.content.querySelectorAll(
    "script, iframe, frame, frameset, object, embed, base, link, meta, svg, math, template",
  ))
    nodo.remove();
  for (const nodo of plantilla.content.querySelectorAll("*")) {
    for (const atributo of Array.from(nodo.attributes)) {
      const nombre = atributo.name.toLowerCase();
      const imagenLocal =
        nodo.tagName === "IMG" &&
        nombre === "src" &&
        /^data:image\/(?:png|jpeg|gif|webp);base64,/i.test(atributo.value);
      if (
        !imagenLocal &&
        (nombre.startsWith("on") ||
          /^(src|srcset|href|xlink:href|action|formaction|poster|background|ping|autofocus|tabindex)$/.test(
            nombre,
          ))
      ) {
        nodo.removeAttribute(atributo.name);
      }
    }
  }
  return plantilla.innerHTML;
}

export function VistaWeb({ html, css }: { html: string; css: string }) {
  const [contenido, setContenido] = useState("");
  useEffect(() => {
    setContenido(htmlEstatico(html));
  }, [html]);
  const estilo = css.replace(/<\/style/gi, "<\\/style");
  const srcDoc =
    '<!doctype html><meta charset="utf-8">' +
    "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; style-src 'unsafe-inline'; img-src data:; form-action 'none'; base-uri 'none'\">" +
    "<style>" +
    estilo +
    "</style>" +
    contenido;
  return (
    <iframe
      title="Vista previa HTML y CSS"
      sandbox=""
      referrerPolicy="no-referrer"
      tabIndex={-1}
      className="pointer-events-none min-h-48 w-full rounded border border-line bg-white"
      srcDoc={srcDoc}
    />
  );
}
