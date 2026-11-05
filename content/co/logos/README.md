# Logos

Logo de cada entidad, para mostrarlo junto a su nombre en la tarjeta.

- Un archivo por entidad, con su `id` de `entidades.yaml`: `claro.png`, `nequi.png`.
- PNG cuadrado de 96 × 96 px (4× los 24 px en pantalla), sin transparencias: el fondo de la marca llena todo el cuadrado.
- Solo el símbolo de la marca: un nombre escrito no se lee a 24 px.
- Menos de 4 KB, para que el build lo incruste en la página y funcione sin conexión.
- Se sirven desde el propio sitio. No se enlazan a servicios externos: cargarlos desde otro dominio le diría a un tercero qué entidad consulta una víctima.

Para preparar uno a partir de una imagen grande (ImageMagick, pngquant y oxipng; en Nix: `nix shell nixpkgs#imagemagick nixpkgs#pngquant nixpkgs#oxipng`):

```sh
magick origen.png -background none -resize 384x384^ -gravity center -extent 384x384 \
  -background "<color de fondo de la marca>" -flatten -resize 96x96 <id>.png
pngquant --force --quality 75-98 --strip --output <id>.png <id>.png
oxipng -o max --strip all <id>.png
```

Si el original es circular o tiene esquinas redondeadas, el color de fondo rellena las esquinas. Sin archivo, la tarjeta muestra solo el nombre.

## Derechos

Los logos son marcas de cada entidad y les pertenecen. Se incluyen solo para identificarla. No se publican bajo la licencia del proyecto: ni AGPL-3.0 ni la CC BY-SA 4.0 del resto de `content/`.
