/**
 * Para trabajos asíncronos que se pisan (por ejemplo, cargar la sesión): cada `begin()` devuelve una función `stale()` que dice
 * si desde entonces empezó otro trabajo. Si es así, el resultado del viejo se descarta.
 */
export function latestOnly(): () => () => boolean {
  let current = 0;
  return () => {
    const mine = ++current;
    return () => mine !== current;
  };
}
