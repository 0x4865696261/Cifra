import { Sandbox } from "@vercel/sandbox";
import type { PlanProceso } from "./plan-juez.server.ts";
import type { Corridas } from "./veredicto-juez.ts";

export async function enSandbox(snapshotId: string, plan: PlanProceso): Promise<Corridas> {
  const limite = AbortSignal.timeout(55_000);
  const sandbox = await Sandbox.create({
    source: { type: "snapshot", snapshotId },
    resources: { vcpus: 1 },
    networkPolicy: "deny-all",
    persistent: false,
    timeout: 45_000,
    signal: limite,
  });
  try {
    const ruta = "/tmp/cifra-peticion.json";
    await sandbox.writeFiles(
      [{ path: ruta, content: Buffer.from(JSON.stringify(plan)), mode: 0o600 }],
      { signal: limite },
    );
    const comando = await sandbox.runCommand({
      cmd: "/usr/bin/python3",
      args: ["-I", "/opt/cifra/runner.py", ruta],
      sudo: true,
      signal: limite,
    });
    if (comando.exitCode !== 0) throw new Error("Falló el supervisor.");
    return JSON.parse(await comando.stdout({ signal: limite })) as Corridas;
  } finally {
    await sandbox.stop({ signal: AbortSignal.timeout(3_000) });
  }
}
