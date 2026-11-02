# Política de verificación de datos

Aplica a todo teléfono, enlace o trámite que una persona pueda seguir después de un robo.

## Requisitos

Cada dato debe incluir:

| Campo | Descripción |
|---|---|
| `fuente` | Página oficial de la entidad, o la mejor fuente disponible si no existe una |
| `verificado` | Fecha en la que una persona comprobó el dato |
| `vence` | Fecha límite para volver a comprobarlo |

```yaml
id: operador-a
nombre: Operador A
linea_robo: "000 000 0000"
fuente: https://ejemplo.com/soporte
verificado: 2026-11-01
vence: 2027-02-01
```

Este ejemplo es ficticio.

## Revisión

Dos personas mantenedoras comprueban el dato en la fuente. No basta con revisar el diff.

## Vencimiento

Un dato vencido no se muestra como vigente. El sitio debe advertirlo hasta que alguien lo verifique de nuevo.
