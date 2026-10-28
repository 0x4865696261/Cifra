/**
 * Ajustes de modelo del navegador. Se guardan en localStorage de este navegador
 * y viajan con cada petición como parte del pedido. El servidor no los guarda.
 */

import { isProviderId, keyLooksValid, providerInfo, type ProviderId } from "@/lib/ai/providers";

export type AiSettings = {
  providerId: ProviderId;
  apiKey: string;
  model: string;
};

const STORAGE_KEY = "cifra-modelo";

export function loadAiSettings(): AiSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { providerId: "xai", apiKey: "", model: "" };
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return { providerId: "xai", apiKey: "", model: "" };
    const record = value as Record<string, unknown>;
    const providerId = typeof record.providerId === "string" && isProviderId(record.providerId)
      ? record.providerId
      : "xai";
    const apiKey = typeof record.apiKey === "string" ? record.apiKey : "";
    const model = typeof record.model === "string" ? record.model : "";
    return { providerId, apiKey, model };
  } catch {
    return { providerId: "xai", apiKey: "", model: "" };
  }
}

export function saveAiSettings(next: AiSettings): { ok: boolean; error?: string } {
  // Igual que el servidor: espacios, comillas y saltos de una clave pegada no son parte de la clave.
  const apiKey = next.apiKey.replace(/[\s"'`]/g, "");
  if (apiKey && !keyLooksValid(next.providerId, apiKey)) {
    return { ok: false, error: "La clave no tiene la forma esperada para ese proveedor." };
  }
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ providerId: next.providerId, apiKey, model: next.model.trim() }),
    );
  } catch {
    return { ok: false, error: "Este navegador no ha guardado los ajustes." };
  }
  return { ok: true };
}

export function clearAiSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No hay nada que recuperar.
  }
}

export function modelInUse(settings: AiSettings): string {
  return settings.model.trim() || providerInfo(settings.providerId).defaultModel;
}

/** Lo que se adjunta a una petición si hay clave propia. Vacío en caso contrario. */
export function credentials(settings: AiSettings): { provider?: string; apiKey?: string; model?: string } {
  const apiKey = settings.apiKey.trim();
  if (!apiKey) return {};
  return { provider: settings.providerId, apiKey, model: settings.model.trim() };
}
