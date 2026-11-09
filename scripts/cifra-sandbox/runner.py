import json
import os
import pwd
import resource
import selectors
import signal
import subprocess
import sys
import tempfile
import time
from pathlib import Path

LIMIT = 64 * 1024
ROOT = Path("/opt/cifra")
ENV = {
    "PATH": f"{ROOT}/bin:/usr/local/bin:/usr/bin:/bin",
    "LANG": "C.UTF-8",
    "HOME": "/tmp",
    "DOTNET_CLI_HOME": "/tmp",
    "DOTNET_SKIP_FIRST_TIME_EXPERIENCE": "1",
    "DOTNET_CLI_TELEMETRY_OPTOUT": "1",
    "GOCACHE": f"{ROOT}/go-cache",
    "GOTOOLCHAIN": "local",
    "GOPROXY": "off",
}

def limites():
    resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
    resource.setrlimit(resource.RLIMIT_FSIZE, (24 * 1024**2, 24 * 1024**2))
    resource.setrlimit(resource.RLIMIT_NPROC, (128, 128))
    resource.setrlimit(resource.RLIMIT_NOFILE, (128, 128))

def resultado(estado, stdout=b"", stderr=b"", codigo=1):
    return {
        "estado": estado,
        "stdout": stdout.decode("utf-8", errors="replace"),
        "stderr": stderr.decode("utf-8", errors="replace"),
        "codigoSalida": codigo,
    }

def correr(comando, cwd, entrada, segundos, identidad):
    datos = entrada.encode("utf-8")
    with tempfile.TemporaryFile() as stdin:
        stdin.write(datos)
        stdin.seek(0)
        proceso = subprocess.Popen(
            comando, cwd=cwd, env=ENV, stdin=stdin, stdout=subprocess.PIPE,
            stderr=subprocess.PIPE, start_new_session=True, preexec_fn=limites, **identidad,
        )
        estado = "ok"
        buffers = {proceso.stdout: bytearray(), proceso.stderr: bytearray()}
        hasta = time.monotonic() + segundos
        try:
            with selectors.DefaultSelector() as selector:
                for canal in buffers:
                    selector.register(canal, selectors.EVENT_READ)
                while selector.get_map():
                    restante = hasta - time.monotonic()
                    if restante <= 0:
                        estado = "tiempo"
                        break
                    for clave, _ in selector.select(restante):
                        canal = clave.fileobj
                        bloque = os.read(canal.fileno(), 8192)
                        if not bloque:
                            selector.unregister(canal)
                            continue
                        libre = LIMIT - sum(map(len, buffers.values()))
                        buffers[canal].extend(bloque[:libre])
                        if len(bloque) > libre:
                            estado = "salida-excedida"
                            break
                    if estado != "ok":
                        break
            if estado == "ok":
                try:
                    proceso.wait(timeout=max(0, hasta - time.monotonic()))
                except subprocess.TimeoutExpired:
                    estado = "tiempo"
        finally:
            try:
                os.killpg(proceso.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            proceso.wait()
            if identidad:
                limpiarHijos(identidad["user"])
            proceso.stdout.close()
            proceso.stderr.close()
        stdout, stderr = buffers.values()
        if estado == "ok" and proceso.returncode:
            estado = "error"
        return resultado(estado, stdout, stderr, proceso.returncode)

def limpiarHijos(uid):
    # Un proceso puede separarse del grupo con setsid. La microVM solo reserva
    # este uid para código no confiable, así que también se barren esos hijos.
    for proceso in Path("/proc").iterdir():
        if not proceso.name.isdecimal():
            continue
        try:
            if proceso.stat().st_uid == uid:
                os.kill(int(proceso.name), signal.SIGKILL)
        except ProcessLookupError:
            pass
        except FileNotFoundError:
            pass

def run(plan, cwd, identidad):
    for nombre, contenido in plan["archivos"].items():
        destino = cwd / nombre
        destino.write_text(contenido, encoding="utf-8")
        if identidad:
            os.chown(destino, identidad["user"], identidad["group"])
    inicio = time.monotonic()
    compilar = plan["compilar"]
    compilacion = correr(compilar, cwd, "", 22, identidad) if compilar else None
    if compilacion and compilacion["estado"] != "ok":
        return {"compilacion": compilacion, "corridas": []}

    corridas = []
    for caso in plan["casos"]:
        restante = 37 - (time.monotonic() - inicio)
        if restante <= 0:
            corridas.append(resultado("tiempo"))
            continue
        comando = [*plan["ejecutar"], *caso["args"]]
        corridas.append(correr(comando, cwd, caso["entrada"], min(restante, 3), identidad))
    return {"compilacion": None, "corridas": corridas}

def main():
    path = Path(sys.argv[1])
    plan = json.loads(path.read_text(encoding="utf-8"))
    path.unlink()
    identidad = {}
    if os.getuid() == 0:
        cuenta = pwd.getpwnam("cifra-runner")
        identidad = {"user": cuenta.pw_uid, "group": cuenta.pw_gid, "extra_groups": []}
    elif os.environ.get("CIFRA_RUNNER_LOCAL") != "1":
        raise RuntimeError("El supervisor necesita una cuenta separada")
    with tempfile.TemporaryDirectory(prefix="cifra-") as tmp:
        root = Path(tmp)
        root.chmod(0o755)
        cwd = root / "codigo"
        cwd.mkdir()
        if identidad:
            os.chown(cwd, identidad["user"], identidad["group"])
        print(json.dumps(run(plan, cwd, identidad), ensure_ascii=True))

if __name__ == "__main__":
    main()
