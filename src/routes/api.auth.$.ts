import { createFileRoute } from "@tanstack/react-router";

async function handle({ request }: { request: Request }) {
  const { auth, authConfigured } = await import("@/lib/auth/server");
  if (!authConfigured)
    return Response.json(null, {
      status: new URL(request.url).pathname.endsWith("/get-session") ? 200 : 503,
    });
  return auth.handler(request);
}

export const Route = createFileRoute("/api/auth/$")({
  server: { handlers: { GET: handle, POST: handle } },
});
