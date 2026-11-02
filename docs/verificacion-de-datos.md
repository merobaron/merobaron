# Política de verificación de datos

Aplica a todo teléfono, enlace, paso o trámite que se muestre en el sitio.

**Sin fuente oficial no se publica.** No se aceptan PR ni datos sin una fuente oficial: ni blogs, ni noticias, ni foros, ni capturas de pantalla, ni "a mí me funcionó".

## Fuente oficial

Una página publicada por la propia entidad (operador, banco, billetera) o por una autoridad pública colombiana. Su dominio debe estar en [`content/co/fuentes-oficiales.json`](../content/co/fuentes-oficiales.json).

La compilación falla si `fuente` o `enlace` apuntan a un dominio que no está en la lista. Agregar un dominio sigue la misma regla que un teléfono: dos personas mantenedoras comprueban que pertenece a la entidad.

## Requisitos

Cada dato debe incluir:

| Campo        | Descripción                                  |
| ------------ | -------------------------------------------- |
| `fuente`     | Página oficial donde aparece el dato         |
| `verificado` | Fecha en la que una persona comprobó el dato |
| `vence`      | Fecha límite para volver a comprobarlo       |

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

Dos personas mantenedoras abren la fuente y comprueban que el dato aparece ahí, tal cual. No basta con revisar el diff.

## Vencimiento

Un dato vencido no se muestra como vigente. El sitio debe advertirlo hasta que alguien lo verifique de nuevo.
