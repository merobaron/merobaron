# MeRobaron

Guía abierta para saber qué hacer después de un robo: bloqueos, claves y denuncia, sin registro.

> **Estado:** en construcción. Todavía no hay sitio publicado y los datos de este repositorio no están listos para usarse en una emergencia.

MeRobaron orienta, pero no reemplaza a tu banco, a tu operador ni a las autoridades.

## Principios

- **Sin registro ni backend:** lo que escribe una persona se queda en su dispositivo.
- **Cada dato con evidencia:** un teléfono o enlace sin fuente y fecha de verificación no se publica.
- **Contenido separado del código:** se puede contribuir sin programar y sumar otros países sin tocar la aplicación.

## Estructura

```text
content/co/   Entidades, líneas y guías de Colombia
docs/         Políticas del proyecto
src/domain/   Reglas del plan, sin dependencias de framework
src/ui/       Componentes del sistema de diseño
tokens/       Tokens de diseño en JSON
```

## Desarrollo

```sh
nix develop
pnpm install
pnpm dev
pnpm test
pnpm build
nix build
```

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) y la [política de verificación de datos](docs/verificacion-de-datos.md). Para reportar una vulnerabilidad, sigue [SECURITY.md](SECURITY.md).

## Licencias

| Qué cubre                                                     | Licencia                                                        | Archivo                                                          |
| ------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------- |
| Todo el repositorio, salvo `content/`                         | [AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.html)     | [LICENSE](LICENSE)                                               |
| `content/`, salvo `content/*/evidencia/` y `content/*/logos/` | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | [LICENSE-CONTENT](LICENSE-CONTENT)                               |
| `content/*/evidencia/`                                        | Ninguna: son páginas de cada entidad                            | [content/co/evidencia/README.md](content/co/evidencia/README.md) |
| `content/*/logos/`                                            | Ninguna: son marcas de cada entidad                             | [content/co/logos/README.md](content/co/logos/README.md)         |

Estas licencias no otorgan derechos sobre el nombre ni el logo de MeRobaron. Una copia o versión modificada no debe presentarse como el proyecto oficial.
