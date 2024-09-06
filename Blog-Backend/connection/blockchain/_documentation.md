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

<!-- añadir separacion -->
------

*no puede pasar de largo la complejidad algoritmica, la blockchain inevitablemente crecera por lo que se debe tener en cuenta la complejidad algoritmica de las operaciones que se realizan en la blockchain.*

----

# [Implementacion de algoritmos en Blockchain Service](blockchainServices.js)


Este documento explica el diseño e implementación en `BlockchainService` que maneja la creación de transacciones, la minería de bloques, la validación de la blockchain, la reorganización y la sincronización en una red peer-to-peer. Se han implementado optimizaciones clave para garantizar la escalabilidad a medida que la blockchain crece.

## Resumen

El servicio se construye sobre varias clases principales:
- **Blockchain:** Maneja la cadena de bloques y las transacciones pendientes.
- **Block:** Representa bloques individuales dentro de la cadena.
- **Node:** Gestiona la comunicación peer-to-peer entre nodos.
- **Transaction:** Representa transacciones dentro de un bloque.
- **Consensus:** Implementa el mecanismo de consenso para sincronizar la blockchain entre los nodos.

Adicionalmente, `BlockchainService` optimiza el manejo de datos usando dos mapas principales:
- `transactionMap`: Almacena transacciones indexadas por su hash para búsquedas rápidas.
- `blockIndexMap`: Almacena bloques por su índice para una recuperación eficiente de los mismos.

## Algoritmos y Optimización

### 1. **Búsqueda de Transacciones por Hash (O(1))**

En una blockchain, encontrar una transacción por su hash es una operación común, especialmente para consultar transacciones específicas. Para hacer esta operación eficiente, se utiliza un **Hash Map** (`transactionMap`) para almacenar las transacciones, indexadas por su hash único.

#### ¿Por qué este enfoque?
- **Enfoque tradicional (O(n)):** Sin el mapa, se tendría que recorrer la blockchain de manera lineal para buscar la transacción, lo que llevaría a una complejidad de tiempo O(n).
- **Enfoque optimizado (O(1)):** Con un `Map`, la operación de búsqueda se reduce a O(1), disminuyendo significativamente el tiempo de recuperación de transacciones, incluso a medida que la blockchain crece.

#### Ejemplo:
```javascript
const transaction = this.transactionMap.get(hash);
if (!transaction) {
    throw new Error(`No se encontró una transacción con el hash: ${hash}`);
}
```

### 2. **Recuperación de Bloques por Índice (O(1))**

De manera similar, los bloques son frecuentemente accedidos por su índice en la cadena. Para optimizar esto, los bloques se almacenan en un **Block Index Map** (`blockIndexMap`), permitiendo una recuperación O(1) de cualquier bloque por su índice.

#### ¿Por qué este enfoque?
- **Enfoque tradicional (O(n)):** Sin un índice, recuperar un bloque por su índice implicaría escanear la blockchain secuencialmente.
- **Enfoque optimizado (O(1)):** Usar un `Map` para indexar los bloques por su posición en la cadena permite una recuperación en tiempo constante.

#### Ejemplo:
```javascript
const block = this.blockIndexMap.get(index);
if (!block) {
    throw new Error(`No se encontró un bloque con el índice: ${index}`);
}
```

### 3. **Minería de Nuevos Bloques**

Cuando se mina un bloque, este se agrega inmediatamente tanto a `transactionMap` como a `blockIndexMap` para un acceso rápido en el futuro. Esto asegura que los mapas se mantengan sincronizados con el último estado de la blockchain.

#### Ejemplo:
```javascript
mineBlock(minerAddress) {
    const newBlock = this.blockchain.minePendingTransactions(minerAddress);
    this.blockIndexMap.set(newBlock.index, newBlock);
    newBlock.data.forEach(transaction => {
        this.transactionMap.set(transaction.hash, newBlock);
    });
    return newBlock;
}
```

### 4. **Reorganización de la Blockchain (O(n))**

En caso de que la blockchain se vuelva inconsistente (por ejemplo, debido a problemas de red o cadenas bifurcadas), un proceso de reorganización asegura que todos los bloques estén correctamente enlazados. La reorganización comienza desde un `startIndex` dado y actualiza los bloques subsiguientes para asegurar que su `previousHash` coincida con el bloque anterior correcto.

#### ¿Por qué este enfoque?
- **Reorganización selectiva (O(n)):** En lugar de reorganizar toda la blockchain, el proceso de reorganización comienza desde el punto donde se detecta la inconsistencia, minimizando el número de bloques que necesitan ser revisados y actualizados.

#### Ejemplo:
```javascript
reorganizeBlockchain(startIndex = 0) {
    let previousBlock = this.blockchain.chain[startIndex - 1] || null;
    for (let i = startIndex; i < this.blockchain.chain.length; i++) {
        const currentBlock = this.blockchain.chain[i];
        if (previousBlock && currentBlock.previousHash !== previousBlock.hash) {
            currentBlock.previousHash = previousBlock.hash;
            currentBlock.hash = currentBlock.calculateHash();
        }
        previousBlock = currentBlock;
    }
}
```

### 5. **Reindexación (O(n))**

Cuando se elimina un bloque o cambia la estructura de la blockchain, es necesario reindexar los bloques subsiguientes para mantener la continuidad. El proceso de reindexación comienza desde el punto de modificación y actualiza el índice de todos los bloques posteriores.

#### ¿Por qué este enfoque?
- **Reindexación eficiente (O(n)):** La reindexación solo afecta a los bloques que siguen al punto de modificación, reduciendo el número de bloques que necesitan ser actualizados.

#### Ejemplo:
```javascript
reindexationBlockchain(startIndex) {
    for (let i = startIndex; i < this.blockchain.chain.length; i++) {
        const block = this.blockchain.chain[i];
        block.index = i;
        this.blockIndexMap.set(i, block);
    }
}
```

### 6. **Algoritmo de Consenso**

La clase `Consensus` es responsable de asegurar que todos los nodos en la red estén de acuerdo sobre la misma versión de la blockchain. Se aplica un algoritmo de consenso que resuelve conflictos y asegura la consistencia en la red distribuida.

#### ¿Por qué este enfoque?
- **Escalabilidad:** A medida que la red crece, el consenso se vuelve crítico para asegurar que todos los nodos estén sincronizados. El algoritmo de consenso garantiza que, incluso con múltiples nodos, la blockchain se mantenga válida y sin conflictos.

### 7. **Eliminación de Bloques por Hash**

El sistema permite eliminar un bloque por su hash de transacción. Una vez que un bloque se elimina, la blockchain se reindexa para mantener la consistencia, y los bloques afectados se actualizan para reflejar la nueva estructura de la cadena.

#### Ejemplo:
```javascript
async removeBlockByHash(hash) {
    const transaction = await this.getTransactionByHash(hash);
    const index = transaction.index;
    this.blockchain.chain.splice(index, 1);
    this.reindexationBlockchain(index);
}
```

## Escalabilidad

A medida que la blockchain crece, los siguientes mecanismos aseguran que el sistema permanezca eficiente:
- **Transaction Map:** Las búsquedas rápidas de transacciones por hash aseguran que las consultas mantengan tiempo constante, incluso con grandes conjuntos de datos.
- **Block Index Map:** La recuperación de bloques por índice está optimizada para tiempo constante, permitiendo que el sistema maneje cadenas largas de manera eficiente.
- **Reorganización selectiva:** Solo se reorganizan los bloques a partir del punto inconsistente, minimizando los recálculos innecesarios.
- **Reindexación:** Solo se actualizan los bloques afectados, manteniendo bajo el uso de recursos durante modificaciones en la blockchain.

## Conclusión

Esta implementación de `BlockchainService` se enfoca en optimizar operaciones fundamentales de la blockchain como las búsquedas de transacciones, la recuperación de bloques, la minería y la reorganización. Al utilizar estructuras de datos apropiadas como `Map` para búsquedas en tiempo constante y minimizar el alcance de las reorganizaciones, el sistema está bien preparado para escalar a medida que la blockchain crece en tamaño y complejidad.

