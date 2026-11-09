import json
import sqlite3
import sys

datos = json.loads(sys.argv[1])
db = sqlite3.connect(":memory:")
db.execute("create table libros (titulo text, paginas integer)")
db.executemany("insert into libros values (?, ?)", datos)
db.execute("pragma query_only = ON")

def autorizar(accion, arg1, arg2, db_name, origen):
    if accion == sqlite3.SQLITE_FUNCTION:
        return sqlite3.SQLITE_DENY if arg2 in {"load_extension", "readfile", "writefile"} else sqlite3.SQLITE_OK
    permitidas = {sqlite3.SQLITE_SELECT, sqlite3.SQLITE_READ, sqlite3.SQLITE_RECURSIVE}
    return sqlite3.SQLITE_OK if accion in permitidas else sqlite3.SQLITE_DENY

db.set_authorizer(autorizar)
db.set_progress_handler(lambda: 1, 200_000)
try:
    cursor = db.execute(open("main.sql", encoding="utf-8").read())
    filas = cursor.fetchmany(201)
    if len(filas) > 200:
        raise ValueError("La consulta supera 200 filas")
    print(json.dumps(filas, ensure_ascii=False, separators=(",", ":")))
except (sqlite3.Error, ValueError) as error:
    print(error, file=sys.stderr)
    sys.exit(1)
