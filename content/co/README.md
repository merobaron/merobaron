# Contenido de Colombia

Entidades, líneas y guías en YAML. Cada dato cumple la [política de verificación](../../docs/verificacion-de-datos.md).

| Archivo                  | Contenido                                                                        |
| ------------------------ | -------------------------------------------------------------------------------- |
| `entidades.yaml`         | Operadores, bancos y autoridades: `id`, `nombre`, `tipo`, `linea_robo`, `enlace` |
| `fuentes-oficiales.json` | Dominios aceptados como fuente oficial                                           |
| `guias.yaml`             | Pasos de cada parte del plan: `id`, `titulo`, `urgencia`, `pasos`                |
| `evidencia/`             | Screenshots de cada fuente; no se publican bajo CC BY-SA                         |
| `logos/`                 | Logo de cada entidad, por `id`; no se publican bajo CC BY-SA                     |

Toda entrada lleva `fuente`, `verificado` y `vence`, y `publicado` si la fuente muestra su fecha. Las entidades llevan `cita` con el texto tal cual de la fuente y, si existen, `archivo` con su captura en web.archive.org y `captura` con su screenshot en `evidencia/`. `fuente` y `enlace` deben estar en un dominio de `fuentes-oficiales.json`. La compilación falla si no se cumple. Un dato vencido se muestra con una advertencia, nunca como vigente.

Las guías y las entidades de denuncia y documento todavía son de ejemplo: su fuente está en `ejemplo.com` y el sitio las marca así. `ejemplo.com` sale de `fuentes-oficiales.json` cuando se reemplace el último dato de ejemplo. Los datos reales se agregan solo cuando dos personas mantenedoras los verifican.

Esta carpeta se publica bajo CC BY-SA 4.0.
