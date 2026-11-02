# Importar una lista desde una foto

En Ventas, `Cargar lista desde foto` abre una herramienta para subir una imagen, girarla, recortarla, extraer pares cantidad/número y revisar la lista antes de preparar un ticket. No registra ventas ni guarda imágenes en la base de datos o en disco.

## Activar Google Cloud Vision

1. En un proyecto de Google Cloud con facturación, habilitar Cloud Vision API.
2. Crear una clave de API restringida a Cloud Vision y, cuando corresponda, al origen de red del servidor.
3. Añadir `GOOGLE_VISION_API_KEY=<clave>` al `.env` local del servidor. Nunca colocar la clave en JavaScript público ni subirla a Git.
4. Reiniciar solamente el contenedor de la API: `docker restart lsapi-2`.
5. Abrir la herramienta. Debe indicar `Lectura de fotos disponible`.

Documentación: https://docs.cloud.google.com/vision/docs/handwriting

Sin la clave, la herramienta muestra que la lectura está pendiente de activación. Permite preparar la foto y revisar filas manuales; no simula resultados de OCR.

## Primera prueba y limitaciones

- Se acepta una foto JPG, PNG o WebP de hasta 12 MB, redimensionada en el navegador a un máximo de 2400 píxeles por lado y enviada como JPG. El backend admite hasta 6 MB de imagen decodificada.
- Elegir Billetes (4 dígitos) o Chances (2 dígitos). Se conserva el texto de los números, incluidos los ceros iniciales.
- Para listas en columnas, recortar una columna si el orden de lectura mezcla cantidades y números. El lector interpreta pares como `1-0031`, `2 15` o `3.1234`. No puede garantizar lectura completa de una lista manuscrita.
- Las filas de baja confianza o con formato incorrecto se marcan para revisar. El texto sin interpretar queda visible: comparar toda la foto y agregar lo faltante. No se sustituyen letras por números.
- La revisión de toda la lista es obligatoria. Los duplicados se indican y sus cantidades se suman al pasar al ticket.
- Importar reemplaza los números del borrador con confirmación si había contenido. Conserva vendedor y título actuales; usa los precios actuales y limpia el modo de edición. No crea ni modifica tickets en la base de datos.
- Las solicitudes de reconocimiento se realizan solo desde el backend, con autenticación, acceso al sorteo, un procesamiento simultáneo por usuario y un intervalo mínimo entre lecturas. No se registra el contenido de las imágenes en logs.
- Antes de confiar en el reconocimiento, probar las fotos reales y comparar todos los números y cantidades; las pruebas automatizadas utilizan respuestas de OCR simuladas y no miden precisión manuscrita.
