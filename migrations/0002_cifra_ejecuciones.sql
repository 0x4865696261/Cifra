create table if not exists cifra_ejecuciones (
  id uuid primary key,
  cuenta text not null,
  creada timestamptz not null,
  finalizada timestamptz
);

create index if not exists cifra_ejecuciones_fecha on cifra_ejecuciones (creada);
create index if not exists cifra_ejecuciones_cuenta_fecha on cifra_ejecuciones (cuenta, creada);

create or replace function cifra_reservar_ejecucion(p_id uuid, p_cuenta text)
returns text language plpgsql volatile as $$
declare
  ahora timestamptz;
begin
  perform pg_advisory_xact_lock(17482931);
  ahora := clock_timestamp();
  delete from cifra_ejecuciones where creada < ahora - interval '30 days';
  if (select count(*) from cifra_ejecuciones) >= 250 then
    return 'global';
  end if;
  if (select count(*) from cifra_ejecuciones
      where cuenta = p_cuenta and creada > ahora - interval '24 hours') >= 10 then
    return 'cuenta';
  end if;
  if (select count(*) from cifra_ejecuciones
      where finalizada is null and creada > ahora - interval '90 seconds') >= 3 then
    return 'ocupado';
  end if;
  insert into cifra_ejecuciones (id, cuenta, creada) values (p_id, p_cuenta, ahora);
  return 'ok';
end;
$$;
