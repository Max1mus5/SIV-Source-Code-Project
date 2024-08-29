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

[*ver codigo*](../blockchain/transactions/transaction.js)

### 4. **Nodos**

Los nodos son los participantes de la red blockchain. Cada nodo tiene una copia de la cadena de bloques y puede validar las transacciones. Los nodos se comunican entre sí para mantener la integridad de la cadena y llegar a un consenso sobre el estado de la red.

[*ver codigo*](../blockchain/nodes/nodes.js)

### 5. **Mecanismo de Consenso**

El mecanismo de consenso es el proceso mediante el cual los nodos de la red llegan a un acuerdo sobre el estado de la cadena de bloques. En este caso, se utiliza un mecanismo de consenso de Prueba de Trabajo (Proof of Work) para validar los bloques y asegurar la integridad de la cadena.

[*ver codigo*](../blockchain/sync/consense.js)


## Manejo de una misma instancia:
para manejar una misma instancia de la blockchain, se opto por crear un archivo que contenga esta instancia alamecenada en si misma para de esta forma todo el programa pueda acceder a la misma instancia de la blockchain.

[*ver codigo*](./blockchainInstance.js)

## Construccion de la Blockchain

La blockchain se reconstruye en caso de caerse el servicio, al momento de reiniciar la aplicacacion desde la base de datos, con el hash de la ultima transaccion se reconstruye la blockchain.

[*ver codigo*](../../run_server.js)

y tambien se actualizan las inter-relaciones de los nodos, cada semana, para lograar asi mas dinamismo, esto quiere decir que los enlasces para compartir los post van a tener una vigencia de 7 dias.
