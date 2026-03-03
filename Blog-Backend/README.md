# Blog-Backend — Notas de Desarrollo

Documentación técnica interna del backend: decisiones de arquitectura, bugs conocidos, problemas de entorno y su solución.

---

## Requisitos de Entorno

| Herramienta | Versión requerida | Notas |
|---|---|---|
| Node.js | **v20.x LTS** (recomendado v20.14.12) | Ver sección de problema crítico abajo |
| npm | v10.x | Incluido con Node 20 |
| Python | v3.x | Requerido por node-gyp para compilar sqlite3 |

> **IMPORTANTE:** No usar Node.js v21, v22, v23 ni v24. `sqlite3` requiere compilación nativa (node-gyp) y actualmente no tiene binarios precompilados (N-API) para versiones de Node superiores a la 20 LTS.

---

## ⚠️ Problema Crítico: `sqlite3` no compila en Node.js > v20

### Qué pasó

`sqlite3` es una dependencia nativa que requiere compilación en C++ mediante `node-gyp`. Al correr `npm install` en **Node.js v21+**, el proceso falla con errores similares a:

```
prebuild-install warn install No prebuilt binaries found (target=undefined runtime=napi)
gyp ERR! find VS could not find a version of Visual Studio 2017 or newer to use
gyp ERR! not ok
```

El error tiene dos causas combinadas:
1. `sqlite3 v5.1.7` no publica binarios precompilados para Node v21+.
2. `node-gyp` (necesario como fallback de compilación) requiere tener **Windows SDK** instalado junto a Visual Studio, que en muchos entornos de desarrollo no está completo.

### Solución: usar Node.js v20 LTS con nvm-windows

**Paso 1 — Instalar nvm-windows** (gestor de versiones de Node):

```bash
winget install coreybutler.nvmforwindows --accept-source-agreements --accept-package-agreements
```

Cerrar y reabrir la terminal después de instalar.

**Paso 2 — Instalar y activar Node 20 LTS:**

```bash
nvm install 20.14.12
nvm use 20.14.12
node --version   # debe mostrar v20.14.12
```

**Paso 3 — Instalar dependencias:**

```bash
cd Blog-Backend
npm install
```

**Paso 4 — Verificar que sqlite3 cargó correctamente:**

```bash
node -e "require('sqlite3'); console.log('sqlite3 OK')"
# debe imprimir: sqlite3 OK
```

### Solución alternativa: Windows Build Tools (si no puedes cambiar Node)

Si por alguna razón debes quedar en Node v24, puedes intentar compilar `sqlite3` instalando las herramientas de compilación de Windows:

```bash
# Como administrador:
npm install --global windows-build-tools
# O instalar Windows SDK manualmente desde:
# https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/
```

Esta opción **no es recomendada** — es más frágil y lenta. Usa Node 20 LTS.

---

## Instalación Completa (paso a paso)

```bash
# 1. Clonar el repositorio
git clone https://github.com/Max1mus5/SIV-Source-Code-Project.git
cd SIV-Source-Code-Project/Blog-Backend

# 2. Verificar versión de Node (debe ser v20.x)
node --version

# 3. Instalar dependencias
npm install

# 4. Crear archivo .env en Blog-Backend/
cp .env.example .env   # o crear manualmente (ver sección Variables de Entorno)

# 5. Iniciar en modo desarrollo
npm run dev
```

---

## Variables de Entorno (`.env`)

Crear el archivo `Blog-Backend/.env` con los siguientes valores:

```env
# Puerto del servidor principal (API REST)
PORT=3000

# Puerto del servidor blockchain
BC_PORT=3001

# URL base del servidor (sin trailing slash)
baseURL=http://localhost

# Clave secreta para firmar JWT (usar string largo y aleatorio en producción)
JWT_SECRET=tu_clave_secreta_muy_larga_aqui

# Ruta del archivo de base de datos SQLite
DATABASE_URL=database.sqlite3

# Correo desde el que se envían los emails (Gmail recomendado)
SIV_EMAIL="tucorreo@gmail.com"

# App Password de Google (verificación en 2 pasos activa requerida)
# Generar en: https://myaccount.google.com/apppasswords
SIV_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

> Para el email: activa la **verificación en dos pasos** en tu cuenta de Google, luego genera una **contraseña de aplicación** en https://myaccount.google.com/apppasswords. Usa esa contraseña en `SIV_APP_PASSWORD`, no tu contraseña real.

---

## Verificar que todo funciona

Con el servidor corriendo (`npm run dev`), verificar:

| Endpoint | URL | Resultado esperado |
|---|---|---|
| Estado API | `GET http://localhost:3000/status` | `{ status: "OK" }` |
| Estado Blockchain | `GET http://localhost:3001/status` | `{ status: "OK" }` |
| Docs Users | `GET http://localhost:3000/user/docs` | JSON con documentación |
| Docs Posts | `GET http://localhost:3000/post/docs` | JSON con documentación |
| Docs Blockchain | `GET http://localhost:3001/blockchain/docs` | JSON con documentación |

---

## Arquitectura de Servidores

El `run_server.js` levanta **dos servidores Express** simultáneamente:

```
Puerto 3000  →  API Principal  (user, post, comments, category, reaction, notifications)
Puerto 3001  →  Blockchain     (blockchain)
```

El servidor principal llama al servidor blockchain vía HTTP interno (`axios`) cada vez que se crea, actualiza o elimina un post.

### Flujo de inicio

```
startServices()
    ├── startServer()        → Sync DB con Sequelize (alter:true), levanta puerto 3000
    ├── blockchainApp.listen → Levanta puerto 3001
    └── mountBlockchain()    → Reconstruye la blockchain desde los posts en DB
                               (cron semanal: domingos a medianoche)
```

---

## Endpoints Disponibles

### Servidor Principal (`localhost:3000`)

| Módulo | Base path | Docs |
|---|---|---|
| Usuarios | `/user` | `/user/docs` |
| Recuperar contraseña | `/reset` | — |
| Posts | `/post` | `/post/docs` |
| Comentarios | `/comments` | — |
| Categorías | `/category` | — |
| Reacciones | `/reaction` | — |
| Notificaciones | `/notifications` | `/notifications/docs` |

### Servidor Blockchain (`localhost:3001`)

| Operación | Método | Ruta |
|---|---|---|
| Estado | GET | `/status` |
| Ver cadena completa | GET | `/blockchain/blockchain` |
| Validar cadena | GET | `/blockchain/validate-blockchain` |
| Crear transacción | POST | `/blockchain/create-transaction` |
| Minar bloque | POST | `/blockchain/mine-block` |
| Obtener por hash | GET | `/blockchain/transaction/:hash` |
| Actualizar transacción | PUT | `/blockchain/update-transaction` |
| Eliminar bloque | DELETE | `/blockchain/block/:hash` |

---

## Estado de Módulos (Sesión Marzo 2026)

| Módulo | Estado | Notas |
|---|---|---|
| User (auth) | ✅ Completo | Login, registro, verificación email, recuperar contraseña |
| Posts | ✅ Completo | CRUD + integración blockchain |
| Comments | ✅ ~95% | Sin blockchain en comentarios, sin editar comentario |
| Reactions | ✅ Completo | Posts y comentarios |
| Category | ✅ Completo | CRUD + relación many-to-many con posts |
| Notifications | ✅ Corregido | Bug de import, campos y métodos faltantes resueltos |
| Blockchain | ✅ ~98% | Validación post-eliminación restaurada |
| Upload imágenes | ✅ Agregado | multer en `/user/profile-image/:username` y `/post/upload-image/:postId` |

### Cambios aplicados en Marzo 2026

**Notificaciones (bug crítico resuelto):**
- `notificationController.js`: el import apuntaba a `notificationUtils` (no existía). Corregido a `notifications.js`.
- Todos los campos del controller usaban los nombres del ORM (`userId`, `isRead`, `content`) en vez del schema real (`user_id`, `read`, `message`). Corregidos.
- Métodos `getAllNotifications` y `getUnreadNotifications` no existían en utils. Implementados.
- Método `markAsRead` en controller tenía nombre distinto al que llamaba el router (`markNotificationAsRead` vs `markAsRead`). Unificado.
- **La ruta `/notifications` no estaba registrada en `run_server.js`.** Añadida.

**Blockchain:**
- Método `createTransaction` estaba duplicado en `blockchainServices.js`. Eliminada la copia sin actualización de mapas.
- Método `mineBlock` estaba duplicado. Conservada la versión que actualiza `blockIndexMap`.
- Validación de cadena en `removeBlockByhash()` estaba comentada. Restaurada con lógica de reorganización automática.

**Imágenes:**
- Instalado `multer`.
- Creado `connection/middlewares/uploadMiddleware.js` con storage separado para perfiles y posts.
- Carpetas `public/uploads/profiles/` y `public/uploads/posts/` creadas.
- `run_server.js` sirve `/uploads` como ruta estática.

---

## Notas de Seguridad para Producción

- Cambiar `JWT_SECRET` a un string de mínimo 64 caracteres aleatorios.
- Configurar HTTPS (cadena SSL/TLS).
- Revisar la política de CORS (`origin: '*'` es solo válido en desarrollo).
- Agregar `helmet` para headers de seguridad:
  ```bash
  npm install helmet
  ```
  ```js
  const helmet = require('helmet');
  app.use(helmet());
  ```
- Mover almacenamiento de imágenes a un servicio cloud (S3, Cloudinary) antes de deployment.
