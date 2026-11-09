import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { NotFound } from "@/components/not-found";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
    defaultPendingComponent: () => (
      <main id="contenido" className="curso-contenedor" role="status">
        Cargando el contenido…
      </main>
    ),
    defaultPendingMs: 120,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
  });
}
