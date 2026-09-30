# 🎂 Cumple de Anto — versión de Valen

Este proyecto está hecho en **HTML + CSS + JavaScript puro**, así que no necesita instalar React, npm ni ninguna librería.

## 1. El archivo que más vas a editar
Abrí **`config.js`**. Ahí están:
- la carta,
- los mensajes de amigos,
- los recuerdos de la constelación,
- las fotos de la galería,
- los ítems del recibo,
- la fecha y la edad.

Dentro de `config.js` dejé también una **nota paso a paso para agregar fotos a la constelación sin tocar el resto del código**.

## 2. Mensajes que faltan
En `config.js` buscá:
- Martina
- Toty
- Cande
- Bruno
- Aye

Reemplazá `MENSAJE PENDIENTE` por el texto real y cambiá `pending: true` por `pending: false`.

## 3. Agregar más fotos a la constelación
1. Copiá la foto a `assets/photos/`.
2. Renombrala con algo simple, por ejemplo `anto-cande.jpg`.
3. En `config.js`, en `constellation`, poné:
   `photo: "assets/photos/anto-cande.jpg"`
4. Si querés un corazón nuevo, duplicá uno de los bloques `{ ... }` de `constellation` y cambiá título/texto/foto.

## 4. Música
Ya está incluida la canción que subiste:
`assets/music/someone-new.mp3`

La música empieza después de que Anto toca **“Abrir regalo”**, porque Chrome/Safari normalmente bloquean la reproducción automática sin interacción.

## 5. Soplar las velitas
La web pide permiso para usar el micrófono. Para que funcione bien, abrila desde **GitHub Pages, Vercel, Netlify o localhost**. En algunos navegadores el micrófono no funciona si abrís `index.html` directamente como archivo.

También dejé un botón **Plan B: apagar con magia** por si el permiso del micro falla.

## 6. Probarla en tu computadora
Una forma fácil si tenés Python:

```bash
python -m http.server 8000
```

Después abrí `http://localhost:8000`.

## 7. Subirla a GitHub Pages
1. Creá un repositorio nuevo.
2. Subí **todo el contenido de esta carpeta** manteniendo las carpetas `assets/photos` y `assets/music`.
3. En GitHub: `Settings` → `Pages`.
4. Elegí `Deploy from a branch` → `main` → `/root`.
5. Guardá. GitHub te dará el link final.

## 8. Qué incluye esta versión
- entrada con cuenta regresiva a los 17,
- música,
- carta de Valen en sobre interactivo,
- mensajes de amigos,
- galería,
- constelación de corazones con recuerdos/fotos,
- torta con 17 velitas y detección de soplido por micrófono,
- aurora boreal al apagar las velitas,
- recibo de amistad,
- lluvia de corazones y fuegos artificiales,
- un easter egg muy específico relacionado con **7 licuados**.

Hecho para que puedas seguir personalizándolo sola sin gastar más cargas de archivos. 🩶
