# Blockchain para Sistema de Blogs Descentralizado

## Descripción 

Este modulo tiene como objectivo crear una plataforma de blogs descentralizada utilizando tecnología blockchain. La idea es que cada publicación de blog sea tratada como una transacción dentro de la blockchain, lo que garantiza la inmutabilidad y la descentralización de los contenidos.

## Estructura

Está organizado en las siguientes carpetas principales:

```
Blog-Backend
├───connection
│   ├───blockchain
│   │   ├───blocks         # Lógica de los bloques
│   │   ├───chain          # Lógica de la cadena de bloques
│   │   ├───sync           # Mecanismo de consenso
│   │   ├───nodes          # Gestión de nodos y comunicación en la red
│   │   └───transactions   # Gestión de transacciones (publicaciones de blog)
```

## ¿Por Qué Utilizar Blockchain para un Blog?

La blockchain es una tecnología que permite registrar transacciones de manera segura y descentralizada. En el contexto de un blog, esto significa que:

- **Inmutabilidad:** Una vez que una publicación es registrada en la blockchain, no puede ser alterada ni eliminada, asegurando la integridad de los contenidos.
- **Descentralización:** Las publicaciones no están controladas por una sola entidad, sino que son validadas por una red de nodos.
- **Transparencia:** Todas las transacciones (publicaciones) son visibles para todos los nodos en la red, lo que aumenta la confianza en el sistema.

## Componentes Clave

### 1. **Bloques**
Cada bloque en la blockchain contiene:
- **Hash del bloque anterior:** Para asegurar la integridad de la cadena.
- **Datos de las transacciones:** En este caso, las publicaciones de blog.
- **Marca de tiempo:** Momento en el que se creó el bloque.
- **Nonce:** Un número utilizado para validar el bloque mediante un mecanismo de consenso.
- **Hash del bloque actual:** Una firma digital única generada a partir del contenido del bloque.

[*ver codigo*](../blockchain//blocks/block.js)

### 2. **Cadena de Bloques (Blockchain)**
La cadena de bloques (blockchain) es una lista enlazada de bloques, donde cada bloque apunta al anterior, formando una cadena continua.

[*ver codigo*](../blockchain//chains/blockchain.js)

### 3. **Transacciones**
Las publicaciones de blog se manejan como transacciones dentro de la blockchain. Cada transacción contiene información sobre el autor, el contenido de la publicación, y la marca de tiempo.

[*ver codigo*](../blockchain/transactions/)

### 4. **Nodos**

### 5. **Mecanismo de Consenso**

## Funcionamiento General

