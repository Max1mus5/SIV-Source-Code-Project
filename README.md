<h1 align="center"> <img src="./public/SIV.jpeg" /><h1/>

#### Semillero de Videojuegos - Universidad Tecnologica de Pereira - Blog🤩 + Blockchain🫠

### [Backend](#backend)
### [Frontend](#Frontend)

Este proyecto es un blog diseñado para registrar el progreso de un semillero de investigación, utilizando tecnología blockchain para asegurar la inmutabilidad y autenticidad de los posts.

## Tecnologías Utilizadas
  Se desarrollo el backend utilizando Node.js, y para mejorar la eficiencia y escalabilidad del proyecto, se utilizaron las siguientes tecnologías:

- **SQLite3**: Base de datos relacional ligera.
- **Express**: Framework para Node.js, facilitando la creación de APIs RESTful.
- **bcryptjs**: Para hashear las contraseñas de los usuarios.
- **jsonwebtoken (JWT)**: Para la autenticación de usuarios mediante tokens.
- **Sequelize**: ORM para gestionar la base de datos SQLite3.
- **NodeMailer**: Para enviar correos electrónicos de verificación y recuperación de contraseñas.
- **Crytpo**: Utilizaremos crypto para generar los bloques de la blockchain.

## Estructura del Servidor

La estructura de carpetas está diseñada para mantener el proyecto organizado, modularizado y si es necesario en un futuro facilitar su escalabilidad:

### `connection`
Esta carpeta se encargará de la conexión a la base de datos y a la red de Ethereum. Está dividida en tres secciones:

- **db**: Maneja la conexión a la base de datos SQLite3.
- **middleware**: Maneja la conexión a la red de Ethereum y la autenticación de usuarios.
- **utils**: Funciones o servicios necesarios para relacionar los módulos con la base de datos y la red de Ethereum.

### `modules`
La carpeta de módulos sera la carpeta encargada de contener una plantilla especifica para cada objeto en el diagrama de clases, permitiendo una mejor organización y escalabilidad del proyecto.

Tener En cuenta la siguiente estructura de clases:
<img src="./public/SIV_Diagrama_de_Clases.svg" alt="Diagrama de clases" width="100%">

Para cada módulo, se incluyen las siguientes subcarpetas:

- **controller**: Maneja las peticiones y respuestas de la aplicación.
- **models**: Define la estructura de la base de datos.
- **routes**: Define las rutas de la aplicación y valida los datos enviados a la API.
- **utils**: Contiene la lógica o servicios que requiere la aplicación.

## Base de Datos

Utilizamos SQLite3 como base de datos. La base de datos se llamará `SIV.db` y contendrá las siguientes tablas y relaciones, basadas en el diagrama implementado para las clases:

<img id="db_structure" src="./public/SIV_DB_Estructura.png" alt="DB_structure" width="100%">

La base de datos estará contenida en `Blog-Backend/connection/db/schemas`, definiendo como "schema" a la estructura modelo para crear una tabla en la base de datos.
Para cada modulo se va a crear un schema con los campos establecidos en [diseño de la base de datos.](#db_structure)

## Rutas de la API

Para ver la documentacion unicamente debes añadir `/docs` al final de la url la ruta, para facilitar la consulta de la documentacion de la API.

Se implemento una API RESTful para el backend, con las siguientes rutas:
### `/user`
### `/reset`
### `/post`
### `/comment`
### `/blockchain`
### `/category`


## Middleware

Se implementaron los siguientes middlewares para la autenticación de usuarios y envio de correos electronicos para recuperar contraseña:
> **JWTmiddleware** verifica si el token enviado por el cliente es válido y si el usuario tiene permisos para acceder a la ruta solicitada., debe ser enviaod en el siguiente formato:
```plaintext
authorization: Bearer <token>
```
> **emailHelper** verifica si el correo electronico enviado por el cliente es valido y permite crear una nueva contraseña de ser asi



## Instalación y Configuración

1. **Clonar el repositorio** y **entrar en la carpeta** del proyecto:
    ```bash
    git clone https://github.com/Max1mus5/SIV-Source-Code-Project.git
    cd SIV-Source-Code-Project
    cd Blog-Backend
    ```


2. **Instalar las dependencias**:
    ```bash
    npm install
    ```

3. **Configurar las variables de entorno**:
    Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
    ```plaintext
    PORT=
    JWT_SECRET=
    DATABASE_URL=
    BACKEND_URL=
    SIV_EMAIL="" # email who sends the emails between ""
    SIV_APP_PASSWORD="" #enable double step verification security in your account and after go to: https://myaccount.google.com/apppasswords

    ```

4. **Iniciar el servidor con nodemon**:
    ```bash
    npm run dev
    ```

5. **Verificar Estado del servidor y de la Blockchain**:
    ```plaintext
    http://localhost:8545/blockchain/status
    http://localhost:8000/status
    ```

## Licencia

Este proyecto está licenciado,  [License](./LICENSE.md)

