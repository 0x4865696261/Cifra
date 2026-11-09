import { readFile } from "node:fs/promises";
import { Sandbox } from "@vercel/sandbox";

if (!process.env.VERCEL_OIDC_TOKEN?.trim()) {
  throw new Error(
    "Carga VERCEL_OIDC_TOKEN desde tu proyecto enlazado. Consulta docs/cifra-1.0-vercel.md.",
  );
}

const sandbox = await Sandbox.create({
  image: "vercel/sandbox/node:24",
  resources: { vcpus: 1 },
  timeout: 600_000,
  persistent: false,
});
try {
  const archivos = ["preparar.sh", "runner.py", "sql.py", "web.cjs"];
  await sandbox.writeFiles(
    await Promise.all(
      archivos.map(async (archivo) => ({
        path: "/tmp/cifra-" + archivo,
        content: (await readFile(new URL(archivo, import.meta.url), "utf8")).replaceAll(
          "\r\n",
          "\n",
        ),
      })),
    ),
  );
  const resolver = await sandbox.runCommand("bash", ["-c", "command -v node; command -v npm"]);
  if (resolver.exitCode !== 0) throw new Error("El runtime no expone Node y npm.");
  const [node, npm] = (await resolver.stdout()).trim().split("\n");
  const instalar = await sandbox.runCommand({
    cmd: "bash",
    args: ["/tmp/cifra-preparar.sh", node, npm],
    sudo: true,
    stdout: process.stdout,
    stderr: process.stderr,
  });
  if (instalar.exitCode !== 0) throw new Error("Falló la preparación de los toolchains.");
  await sandbox.runCommand("rm", ["/tmp/cifra-preparar.sh"]);
  await sandbox.update({ networkPolicy: "deny-all" });
  const snapshot = await sandbox.snapshot({ expiration: 0 });
  console.log("CIFRA_SANDBOX_SNAPSHOT=" + snapshot.snapshotId);
} finally {
  await sandbox.stop().catch(() => undefined);
}
