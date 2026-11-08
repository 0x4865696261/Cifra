import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { Shell } from "@/components/shell";
import { LevelProvider } from "@/lib/level";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cifra" },
      {
        name: "description",
        content:
          "Cifra enseña a entender programas: leer código, pasar de una fórmula a una implementación y ver por qué se tomó cada decisión.",
      },
      { name: "theme-color", content: "#f3f6fc" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="es" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <LevelProvider>
            <Shell>
              <Outlet />
            </Shell>
          </LevelProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
