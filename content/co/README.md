# Contenido de Colombia

Entidades, líneas y guías en YAML. Cada dato cumple la [política de verificación](../../docs/verificacion-de-datos.md).

| Archivo                  | Contenido                                                                        |
| ------------------------ | -------------------------------------------------------------------------------- |
| `entidades.yaml`         | Operadores, bancos y autoridades: `id`, `nombre`, `tipo`, `linea_robo`, `enlace` |
| `fuentes-oficiales.json` | Dominios aceptados como fuente oficial                                           |
| `guias.yaml`             | Pasos de cada parte del plan: `id`, `titulo`, `urgencia`, `pasos`                |

Toda entrada lleva `fuente`, `verificado` y `vence`, y `publicado` si la fuente muestra su fecha. `fuente` y `enlace` deben estar en un dominio de `fuentes-oficiales.json`. La compilación falla si no se cumple. Un dato vencido se muestra con una advertencia, nunca como vigente.

Por ahora todos los datos son de ejemplo (Operador A, Banco A, `000 000 0000`). Los datos reales se agregan solo cuando dos personas mantenedoras los verifican.

Esta carpeta se publica bajo CC BY-SA 4.0.
