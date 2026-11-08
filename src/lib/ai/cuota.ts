const ventanaMs = 10 * 60 * 1000;
const maximoPorIp = 8;
const maximoGlobal = 30;

/** Presupuesto por proceso, compartido por todas las superficies del modelo. */
export function crearCuotaIa(ahora = Date.now) {
  let admitidas: { ip: string; instante: number }[] = [];
  return (ip: string) => {
    const instante = ahora();
    admitidas = admitidas.filter((llamada) => instante - llamada.instante < ventanaMs);
    if (admitidas.length >= maximoGlobal) return false;
    if (admitidas.filter((llamada) => llamada.ip === ip).length >= maximoPorIp) return false;
    admitidas.push({ ip, instante });
    return true;
  };
}

export const admitirLlamadaIa = crearCuotaIa();
