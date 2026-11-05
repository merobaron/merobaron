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
| `publicado`  | Opcional. Fecha de publicación o actualización que muestra la fuente. Solo si la página la muestra; nunca se estima |
| `cita`       | Texto tal cual aparece en la fuente. Si hay línea de robo, debe contenerla |
| `archivo`    | Opcional. Captura de la fuente en [web.archive.org](https://web.archive.org) |
| `captura`    | Opcional. Screenshot de la fuente con la cita resaltada, relativa a la carpeta del país: `evidencia/<id>.png` |

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

Un PR por fuente: cada PR cambia datos de una sola URL de `fuente`. La CI lo comprueba.

Dos personas mantenedoras abren la fuente y comprueban que el dato aparece ahí, tal cual. No basta con revisar el diff.

## Cita y captura

La `cita` ubica el dato en la página: el sitio enlaza la fuente con un fragmento de texto (`#:~:text=`) que la abre resaltada, y en cada PR la CI abre la fuente, resalta la cita y sube una captura como artifact (`capturas-de-fuentes`). Si la cita no aparece o el sitio bloquea el acceso automático, la CI avisa y la revisión se hace a mano. No se intenta evadir ese bloqueo.

Cada PR guarda la screenshot de su fuente en `content/co/evidencia/<id>.png` y la enlaza en `captura`. Se toma con `node scripts/screenshot-sources.mjs <rama-base> content/co/evidencia`, que estampa la URL y la fecha. Una screenshot que no muestra el dato (página bloqueada, cita oculta) no se guarda: se toma a mano. Ver [`evidencia/`](../content/co/evidencia/README.md).

El `archivo` es una captura con fecha puesta por un tercero, útil si la entidad cambia la página. Crea una con `https://web.archive.org/save/<fuente>`.

## Fuentes antiguas

`publicado` no indica vigencia: eso lo indica `verificado`. Sirve para detectar fuentes viejas. Si tiene más de 2 años, la revisión confirma que no hay una página más reciente de la misma entidad que la reemplace.

## Vencimiento

Un dato vencido no se muestra como vigente. El sitio debe advertirlo hasta que alguien lo verifique de nuevo.
