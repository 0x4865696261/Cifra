import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";

export function CuentaJuez() {
  const sesion = authClient.useSession();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  if (sesion.isPending)
    return (
      <p className="text-xs text-muted" role="status">
        Comprobando sesión…
      </p>
    );
  if (sesion.data)
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>{sesion.data.user.name}</span>
        <button
          type="button"
          className="underline"
          disabled={ocupado}
          onClick={async () => {
            setOcupado(true);
            try {
              const respuesta = await authClient.signOut();
              if (respuesta.error) setError("No se pudo cerrar sesión.");
            } catch {
              setError("No se pudo cerrar sesión.");
            } finally {
              setOcupado(false);
            }
          }}
        >
          Cerrar sesión
        </button>
        {error && <span role="alert">{error}</span>}
      </div>
    );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        tone="ghost"
        disabled={ocupado}
        onClick={async () => {
          setOcupado(true);
          setError("");
          try {
            const destino = window.location.pathname + window.location.search;
            const respuesta = await authClient.signIn.social({
              provider: "github",
              callbackURL: destino,
              errorCallbackURL: destino,
            });
            if (respuesta.error) setError("El acceso con GitHub no está disponible. Si administras Cifra, revisa las variables OAuth del entorno.");
          } catch {
            setError("No se pudo conectar con GitHub. Inténtalo de nuevo.");
          } finally {
            setOcupado(false);
          }
        }}
      >
        Continuar con GitHub
      </Button>
      {error && (
        <span role="alert" className="text-xs">
          {error}
        </span>
      )}
    </div>
  );
}
