# Cómo contribuir

Un número falso aceptado aquí puede mandar a una víctima directo a un estafador. Por eso los cambios se revisan según su riesgo y **todo dato necesita una fuente oficial**. Un PR o issue sin ella se cierra.

## Sin programar

¿Conoces un teléfono, enlace o paso que falta o está mal? Abre un issue con el formulario **Proponer o corregir un dato**. Alguien del equipo lo convierte en PR.

## Flujo

1. Abre un PR corto contra `main`.
2. Usa [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) en tus commits.
3. Consigue las revisiones que correspondan:

| Cambio                                  | Revisiones                        | Requisito                                                            |
| --------------------------------------- | --------------------------------- | -------------------------------------------------------------------- |
| Código                                  | 1                                 | CI en verde cuando esté disponible                                   |
| Contenido general                       | 1                                 | Cumplir la [política de verificación](docs/verificacion-de-datos.md) |
| Teléfonos, enlaces y dominios oficiales | 2 de mantenedores, sin auto-merge | Cumplir la [política de verificación](docs/verificacion-de-datos.md) |

## Un PR por fuente

Cada PR agrega, corrige o borra datos de **una sola fuente**: una URL en `fuente`. Así cada revisión abre una sola página y la compara con el diff. Varias entradas o guías que citan la misma página pueden ir juntas.

La CI lo comprueba. Un dominio nuevo en `fuentes-oficiales.json` va en el mismo PR que la fuente que lo usa.

## Datos personales

No incluyas datos personales en issues, PR ni capturas de pantalla, ni tuyos ni de otras personas. Esto incluye cédulas, números de cuenta, IMEI y denuncias.

## Licencia de tus aportes

Al contribuir aceptas que tu aporte se publique bajo la licencia de la carpeta que modificas: CC BY-SA 4.0 en `content/` y AGPL-3.0-only en el resto del repositorio. Las screenshots de `content/*/evidencia/` y los logos de `content/*/logos/` no se licencian: son páginas y marcas de cada entidad.

## Convivencia

Este proyecto sigue el [Código de conducta](CODE_OF_CONDUCT.md).
