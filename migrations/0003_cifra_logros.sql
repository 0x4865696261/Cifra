create table if not exists cifra_logros (
  cuenta text not null references "user" ("id") on delete cascade,
  reto text not null,
  lenguaje text not null,
  resuelto timestamptz not null default now(),
  primary key (cuenta, reto, lenguaje)
);

create table if not exists cifra_portafolios (
  cuenta text primary key references "user" ("id") on delete cascade,
  github_id text not null
);
