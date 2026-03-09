# Tests — SIV Blog Backend

## Por qué testeamos este proyecto

Este backend tiene una **característica crítica** que la mayoría de APIs no tienen: una blockchain
propia que actúa como registro inmutable de autoría de posts. Cada post publicado queda vinculado
a un hash de bloque guardado en la columna `hashBlockchain` de la tabla `Posts`.

Si cualquier cambio en `Node.js`, en `Sequelize`, en las dependencias, o en el propio código
modifica la forma en que se calculan los hashes, los posts ya publicados quedarían **huérfanos**:
la DB tenga un hash que ya no coincide con ningún bloque en memoria. Los tests de regresión del
módulo blockchain están aquí precisamente para detectar ese escenario **antes** de que llegue a
producción.

---

## Estructura

```
tests/
├── setup.js                          # Variables de entorno para todos los tests
├── helpers/
│   ├── testApp.js                    # App Express sin listen() ni blockchain mount
│   ├── testDb.js                     # setup/teardown de SQLite en memoria
│   └── authHelper.js                 # Genera tokens JWT y usuarios de prueba
│
├── unit/
│   ├── blockchain/
│   │   ├── block.test.js             # Clase Block: hash, minado
│   │   ├── transaction.test.js       # Clase Transaction: hash, firma
│   │   ├── consensus.test.js         # Proof of Work, validación de cadena
│   │   └── blockchainService.test.js # Tests mas criticos — servicio completo
│   └── utils/
│       └── userUtils.test.js         # validatePassword, validateEmail, hashPassword
│
└── integration/
    ├── status.test.js                # GET /status — salud del servidor
    ├── auth.test.js                  # Registro, login, verificación de cuenta
    ├── posts.test.js                 # CRUD de posts (blockchain mockeado)
    ├── notifications.test.js         # CRUD completo de notificaciones
    └── comments.test.js              # Crear, listar, eliminar comentarios
```

---

## Comandos

```powershell
# Todos los tests
npm test

# Solo unitarios (más rápidos, sin DB)
npm run test:unit

# Solo integración (con DB en memoria)
npm run test:integration

# Modo watch (re-ejecuta al guardar archivos)
npm run test:watch

# Con cobertura de código
npm run test:coverage
```

> **Importante:** siempre ejecutar con Node 20.
> Si tienes varios Node instalados, usa el script de fnm:
> ```powershell
> # Desde Blog-Backend/
> $env:PATH = "C:\Users\Asus\AppData\Roaming\fnm\node-versions\v20.20.0\installation;$env:PATH"
> npm test
> ```

---

## Cómo funcionan los tests

### Base de datos

Los tests de integración usan **SQLite en memoria** (`:memory:`). Esto significa:
- Completamente aislados de la DB de desarrollo (`database.sqlite3`)
- Cada suite (`describe` de nivel superior) parte de una DB limpia
- Se activa automáticamente cuando `NODE_ENV=test` (configurado en `tests/setup.js`)

La variable de control está en `connection/db/database.js`:
```js
const storage = process.env.NODE_ENV === 'test' ? ':memory:' : 'database.sqlite3';
```

### Email

Los tests mockean el módulo de envío de correos (`connection/utils/recoverPassword`)
para evitar llamadas reales a SMTP:
```js
jest.mock('../../connection/utils/recoverPassword', () => ({
    sendVerificationEmail: jest.fn().mockResolvedValue({ accepted: [...] }),
    ...
}));
```

### Blockchain en integración

Los tests de posts mockean `axios` para simular las respuestas del servidor de blockchain
(puerto 3001) sin necesitar que esté corriendo:
```js
jest.mock('axios');
axios.post.mockImplementation((url) => { ... });
```

Los tests unitarios del módulo blockchain no usan mocks — prueban directamente las clases.

---

## Por que `blockchainService.test.js` es el mas importante

Este archivo cubre el servicio que orquesta toda la blockchain. Si falla algo aquí,
significa que una de estas cosas cambió sin querer:

| Escenario de rotura | Test que lo detecta |
|---|---|
| SHA-256 calcula distinto (cambio de Node/crypto) | `REGRESSION: la fórmula de hash...` en `transaction.test.js` |
| `mineBlock` no actualiza `blockIndexMap` | `las transacciones del bloque quedan indexadas...` |
| `updateTransaction` hace await incorrecto | `actualiza author y content de la transacción` |
| `removeBlockByIndex(0)` ya no protege el génesis | `removeBlockByIndex(0) lanza: no se puede eliminar...` |
| La cadena se corrompe después de eliminar un bloque | `la cadena sigue siendo válida después de removeBlock...` |
| Nueva versión de Node cambia serialización de `JSON.stringify` | `REGRESSION: la fórmula de hash usa author+content+timestamp+type` |

**Regla de equipo:** si cambias cualquier archivo dentro de `connection/blockchain/`, corre al
menos `npm run test:unit` antes de hacer push.

---

## Agregar nuevos tests

### Test unitario de blockchain
Colócalo en `tests/unit/blockchain/` y sigue el patrón de instanciar `new BlockchainService()`
(no el singleton `blockchainInstance`) para tener estado limpio.

### Test de integración de nuevo módulo
1. Importa `testApp`, `setupTestDb`, `teardownTestDb` y `createTestUser`
2. Usa `beforeAll/afterAll` para ciclo de vida de DB
3. Inserta datos de prueba directamente en los modelos de Sequelize (sin pasar por HTTP)
4. Mockea axios si el controller llama al servidor blockchain

### Datos mínimos de un post en DB
```js
await Posts.create({
    autor_id:       userId,
    date:           new Date().toISOString(),
    title:          'Título',
    content:        'Contenido',
    likes:          0,
    post_image:     '',
    hashBlockchain: 'un_hash_cualquiera',
    comments:       0,
});
```

---

## Estado de cobertura (Marzo 2026)

| Módulo | Tipo | Tests |
|---|---|---|
| `Block` | Unitario | 10 tests |
| `Transaction` | Unitario | 14 tests |
| `Consensus` | Unitario | 18 tests |
| `BlockchainService` | Unitario | 30+ tests |
| `userUtils` | Unitario | 9 tests |
| Auth (register/login/verify) | Integración | 13 tests |
| Posts (crear/listar/imagen) | Integración | 11 tests |
| Notifications (CRUD) | Integración | 18 tests |
| Comments (crear/listar/borrar) | Integración | 12 tests |
| Status | Integración | 3 tests |

**Pendiente:**
- Reactions (crear, eliminar, listar por post/comentario)
- Categories (CRUD)
- Password recovery flow completo
- Tests E2E con blockchain server real (una vez el frontend esté listo)
