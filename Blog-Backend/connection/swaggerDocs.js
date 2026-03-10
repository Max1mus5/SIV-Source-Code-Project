const swaggerUi = require('swagger-ui-express');

// ─────────────────────────────────────────────────────────────────────────────
// OpenAPI 3.0 Specification — SIV Blog Backend
// ─────────────────────────────────────────────────────────────────────────────
const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'SIV Blog API',
    version: '1.0.0',
    description:
      'REST API del Semillero de Investigación en Videojuegos y Gamificación (SIV) — Universidad Tecnológica de Pereira.\n\n' +
      '**Autenticación:** Las rutas protegidas requieren un token JWT como `Authorization: Bearer <token>`. ' +
      'Obtén tu token en `POST /user/login`.',
    contact: {
      name: 'SIV Team',
      email: 'j.riveros@utp.edu.co',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local de desarrollo',
    },
  ],
  tags: [
    { name: 'Status', description: 'Health check del servidor' },
    { name: 'Auth', description: 'Registro, login y verificación de cuenta' },
    { name: 'User', description: 'Gestión de perfil de usuario' },
    { name: 'Posts', description: 'Publicaciones del blog' },
    { name: 'Comments', description: 'Comentarios en publicaciones' },
    { name: 'Reactions', description: 'Reacciones (likes) en posts y comentarios' },
    { name: 'Categories', description: 'Categorías de publicaciones' },
    { name: 'Notifications', description: 'Notificaciones del usuario' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido en POST /user/login',
      },
    },
    schemas: {
      // ── Common ──────────────────────────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'error' },
          code: { type: 'string', example: 'AUTHENTICATION_ERROR' },
          message: { type: 'string', example: 'Credenciales inválidas' },
        },
      },
      // ── User ────────────────────────────────────────────────────────────
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'jeronimo_riveros' },
          email: { type: 'string', format: 'email', example: 'j.riveros@utp.edu.co' },
          bio: { type: 'string', example: 'Desarrollador de videojuegos' },
          role: { type: 'string', enum: ['reader', 'author', 'admin'], example: 'author' },
          profileImage: { type: 'string', example: '/uploads/profiles/avatar.jpg' },
        },
      },
      RegisterBody: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, example: 'jeronimo_riveros' },
          email: { type: 'string', format: 'email', example: 'j.riveros@utp.edu.co' },
          password: {
            type: 'string',
            minLength: 8,
            description: 'Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 carácter especial',
            example: 'MiPass1!',
          },
          bio: { type: 'string', example: 'Desarrollador de videojuegos' },
          role: { type: 'string', enum: ['reader', 'author'], default: 'reader' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, example: 'jeronimo_riveros' },
          password: { type: 'string', minLength: 6, example: 'MiPass1!' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'success' },
          data: {
            type: 'object',
            properties: {
              token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              user: { $ref: '#/components/schemas/UserPublic' },
              expiresIn: { type: 'integer', example: 14400, description: 'Segundos' },
            },
          },
        },
      },
      // ── Post ────────────────────────────────────────────────────────────
      Post: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          autor_id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Introducción a Unity' },
          content: { type: 'string', example: '<p>Contenido HTML del post...</p>' },
          post_image: { type: 'string', example: '/uploads/posts/imagen.jpg' },
          likes: { type: 'integer', example: 42 },
          comments: { type: 'integer', example: 8 },
          hashBlockchain: { type: 'string', example: '000abc123...' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePostBody: {
        type: 'object',
        required: ['autor', 'title', 'content', 'image'],
        properties: {
          autor: { type: 'integer', example: 1, description: 'ID del autor (user.id)' },
          title: { type: 'string', example: 'Introducción a Unity' },
          content: { type: 'string', example: '<p>Contenido HTML del post...</p>' },
          image: { type: 'string', example: '', description: 'URL de imagen (puede estar vacío hasta subirla)' },
          hashBlockchain: { type: 'string', example: null },
          likes: { type: 'integer', default: 0 },
        },
      },
      UpdatePostBody: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          autor_id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Título actualizado' },
          content: { type: 'string', example: '<p>Contenido actualizado</p>' },
          post_image: { type: 'string', example: '/uploads/posts/nueva-imagen.jpg' },
        },
      },
      // ── Comment ─────────────────────────────────────────────────────────
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 1 },
          post_id: { type: 'integer', example: 1 },
          content: { type: 'string', example: 'Excelente publicación!' },
          creationDate: { type: 'string', format: 'date-time' },
          comment_id: { type: 'integer', nullable: true, description: 'ID del comentario padre (si es respuesta)' },
        },
      },
      CreateCommentBody: {
        type: 'object',
        required: ['autor', 'content', 'post_id'],
        properties: {
          autor: { type: 'integer', example: 1, description: 'ID del usuario' },
          content: { type: 'string', example: 'Excelente publicación!' },
          post_id: { type: 'integer', example: 1 },
          answerComment_id: { type: 'integer', nullable: true, description: 'ID del comentario al que responde' },
        },
      },
      // ── Reaction ────────────────────────────────────────────────────────
      Reaction: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 1 },
          post_id: { type: 'integer', nullable: true, example: 1 },
          comment_id: { type: 'integer', nullable: true, example: null },
          reaction: { type: 'string', example: 'like' },
          creationDate: { type: 'string', format: 'date-time' },
        },
      },
      CreateReactionBody: {
        type: 'object',
        required: ['user_id', 'reaction'],
        properties: {
          user_id: { type: 'integer', example: 1 },
          post_id: { type: 'integer', nullable: true, example: 1, description: 'Proporcionar post_id o comment_id' },
          comment_id: { type: 'integer', nullable: true, example: null },
          reaction: { type: 'string', example: 'like' },
        },
      },
      // ── Category ────────────────────────────────────────────────────────
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Unity' },
          posts: { type: 'array', items: { type: 'integer' }, example: [1, 2, 3] },
        },
      },
      // ── Notification ────────────────────────────────────────────────────
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 1 },
          type: { type: 'string', example: 'comment' },
          message: { type: 'string', example: 'Alguien comentó tu publicación' },
          isRead: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Token JWT inválido o no proporcionado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { status: 'error', code: 'UNAUTHORIZED', message: 'Token no válido' },
          },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { status: 'error', message: 'Recurso no encontrado' },
          },
        },
      },
      TooManyRequests: {
        description: 'Demasiadas solicitudes (rate limit)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              status: 'error',
              code: 'TOO_MANY_REQUESTS',
              message: 'Demasiados intentos. Intente en 15 minutos.',
            },
          },
        },
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  paths: {
    // ── STATUS ─────────────────────────────────────────────────────────────
    '/status': {
      get: {
        tags: ['Status'],
        summary: 'Health check del servidor',
        description: 'Verifica que el servidor y la base de datos estén operativos.',
        responses: {
          200: {
            description: 'Servidor operativo',
            content: {
              'application/json': {
                example: { status: 'OK', message: 'Backend Service is running', dbStatus: 'Connected' },
              },
            },
          },
        },
      },
    },

    // ── AUTH ───────────────────────────────────────────────────────────────
    '/user/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar nuevo usuario',
        description:
          'Crea una cuenta nueva y envía un correo de verificación. ' +
          '**Rate limit:** 5 intentos por hora.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuario creado. Se envió correo de verificación.',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: 'Se ha enviado un correo de verificación a su email',
                  data: {
                    userId: 1,
                    email: 'j.riveros@utp.edu.co',
                    verificationDeadline: '2026-03-10T00:00:00.000Z',
                  },
                },
              },
            },
          },
          400: { description: 'Error de validación (usuario/email duplicado, contraseña débil)' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },

    '/user/verify/{token}': {
      get: {
        tags: ['Auth'],
        summary: 'Verificar cuenta por email',
        description: 'Activa la cuenta utilizando el token enviado al correo. El token expira en 20 minutos.',
        parameters: [
          {
            name: 'token',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Token JWT de verificación recibido por correo',
          },
        ],
        responses: {
          200: {
            description: 'Cuenta verificada exitosamente',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  message: '¡Hola jeronimo_riveros! Tu cuenta ha sido verificada con éxito.',
                  redirectUrl: 'http://localhost:3001/login',
                },
              },
            },
          },
          400: { description: 'Token inválido o expirado' },
        },
      },
    },

    '/user/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión',
        description:
          'Autentica al usuario y devuelve un JWT válido por 4 horas. **Rate limit:** 5 intentos por 15 minutos.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBody' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login exitoso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          401: { description: 'Credenciales inválidas' },
          403: {
            description: 'Cuenta no verificada (`ACCOUNT_NOT_VERIFIED`)',
            content: {
              'application/json': {
                example: { status: 'error', code: 'ACCOUNT_NOT_VERIFIED', message: 'Por favor verifique su cuenta' },
              },
            },
          },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },

    '/user/recover-password': {
      post: {
        tags: ['Auth'],
        summary: 'Solicitar recuperación de contraseña',
        description: 'Envía un enlace de restablecimiento al email. **Rate limit:** 3 intentos por hora.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email', example: 'j.riveros@utp.edu.co' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Enlace de recuperación enviado' },
          400: { description: 'Email no registrado' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },

    '/reset/{token}': {
      put: {
        tags: ['Auth'],
        summary: 'Restablecer contraseña',
        description: 'Establece una nueva contraseña usando el token de recuperación.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'token',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Token de recuperación recibido por correo',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['newPassword'],
                properties: { newPassword: { type: 'string', minLength: 8, example: 'NuevaPass1!' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Contraseña restablecida exitosamente' },
          400: { description: 'Token inválido o expirado' },
        },
      },
    },

    // ── USER ───────────────────────────────────────────────────────────────
    '/user/{username}': {
      get: {
        tags: ['User'],
        summary: 'Obtener usuario por username',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'username', in: 'path', required: true, schema: { type: 'string' }, example: 'jeronimo_riveros' },
        ],
        responses: {
          200: {
            description: 'Datos del usuario',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPublic' } } },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/user/profile/{username}': {
      put: {
        tags: ['User'],
        summary: 'Actualizar perfil de usuario',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'username', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  username: { type: 'string', minLength: 3 },
                  email: { type: 'string', format: 'email' },
                  bio: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Perfil actualizado' },
          400: { description: 'Error de validación' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/user/profile-image/{username}': {
      put: {
        tags: ['User'],
        summary: 'Subir imagen de perfil',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'username', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Archivo de imagen (jpg, png, webp)' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Imagen de perfil actualizada',
            content: {
              'application/json': {
                example: { status: 'success', data: { profileImage: '/uploads/profiles/avatar.jpg' } },
              },
            },
          },
          400: { description: 'No se proporcionó imagen' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/user/account': {
      delete: {
        tags: ['User'],
        summary: 'Eliminar cuenta',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'email', in: 'query', required: true, schema: { type: 'string', format: 'email' } },
        ],
        responses: {
          200: { description: 'Cuenta eliminada exitosamente' },
          400: { description: 'Error al eliminar' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── POSTS ──────────────────────────────────────────────────────────────
    '/post/feed': {
      get: {
        tags: ['Posts'],
        summary: 'Obtener todos los posts (feed público)',
        description: 'Devuelve todos los posts ordenados por fecha de actualización (más recientes primero). No requiere autenticación.',
        responses: {
          200: {
            description: 'Lista de posts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Post' } },
                  },
                },
              },
            },
          },
          500: { description: 'Error interno del servidor' },
        },
      },
    },

    '/post/my-feed': {
      get: {
        tags: ['Posts'],
        summary: 'Obtener feed (autenticado)',
        description: 'Igual que /post/feed pero requiere autenticación JWT.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Lista de posts del usuario autenticado' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/post/{hash}/{autor}': {
      get: {
        tags: ['Posts'],
        summary: 'Obtener post individual',
        description: 'Devuelve el post con su información de blockchain. No requiere autenticación.',
        parameters: [
          { name: 'hash', in: 'path', required: true, schema: { type: 'string' }, description: 'Hash blockchain del post', example: '000abc123def' },
          { name: 'autor', in: 'path', required: true, schema: { type: 'string' }, description: 'ID del autor', example: '1' },
        ],
        responses: {
          200: {
            description: 'Post con datos de blockchain',
            content: {
              'application/json': {
                example: {
                  post: { id: 1, title: 'Introducción a Unity', autor_id: 1, hashBlockchain: '000abc123def' },
                  blockchainData: { from: 1, hash: '000abc123def', index: 5 },
                },
              },
            },
          },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/post/create-new-publication': {
      post: {
        tags: ['Posts'],
        summary: 'Crear nueva publicación',
        description:
          'Crea un post y lo registra en la blockchain (minado automático). ' +
          'El proceso puede tardar unos segundos mientras se mina el bloque.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePostBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Post creado y minado en blockchain',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Post' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { description: 'Error al crear la publicación o en la blockchain' },
        },
      },
    },

    '/post/upload-image/{postId}': {
      put: {
        tags: ['Posts'],
        summary: 'Subir imagen de un post',
        description: 'Actualiza el campo `post_image` de un post existente. Solo el autor o un admin pueden hacerlo.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Archivo de imagen' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Imagen actualizada',
            content: {
              'application/json': {
                example: { status: 'success', data: { post_image: '/uploads/posts/imagen.jpg' } },
              },
            },
          },
          400: { description: 'No se proporcionó imagen' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'Sin permisos para modificar este post' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/post/update-publication': {
      put: {
        tags: ['Posts'],
        summary: 'Actualizar publicación',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePostBody' },
            },
          },
        },
        responses: {
          200: { description: 'Post actualizado' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/post/share-post/{postId}': {
      post: {
        tags: ['Posts'],
        summary: 'Compartir un post',
        description: 'Crea una copia del post asociada al usuario que comparte. Se registra en blockchain.',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: { userId: { type: 'integer', example: 2 } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Post compartido exitosamente' },
          400: { description: 'Post no encontrado' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/post/get-list-post': {
      get: {
        tags: ['Posts'],
        summary: 'Obtener posts por IDs',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'arrayPostId',
            in: 'query',
            required: true,
            schema: { type: 'array', items: { type: 'integer' } },
            style: 'form',
            explode: true,
            example: [1, 2, 3],
            description: 'Array de IDs de posts',
          },
        ],
        responses: {
          200: { description: 'Lista de posts solicitados' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/post/delete-publication/{postid}': {
      delete: {
        tags: ['Posts'],
        summary: 'Eliminar publicación',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'postid', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'Post eliminado' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ── COMMENTS ───────────────────────────────────────────────────────────
    '/comments/': {
      post: {
        tags: ['Comments'],
        summary: 'Crear comentario',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCommentBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Comentario creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { $ref: '#/components/schemas/Comment' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { description: 'Error al crear el comentario' },
        },
      },
    },

    '/comments/{post_id}': {
      get: {
        tags: ['Comments'],
        summary: 'Obtener comentarios de un post',
        description: 'Devuelve comentarios agrupados en árbol (padre e hijos). No requiere autenticación.',
        parameters: [
          { name: 'post_id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: {
            description: 'Lista de comentarios en formato árbol',
            content: {
              'application/json': {
                example: {
                  status: 'success',
                  data: [[{ id: 1, content: 'Comentario principal', children: [{ id: 2, content: 'Respuesta' }] }]],
                },
              },
            },
          },
          500: { description: 'Error al obtener comentarios' },
        },
      },
      delete: {
        tags: ['Comments'],
        summary: 'Eliminar comentario',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'post_id', in: 'path', required: true, schema: { type: 'integer' }, description: 'ID del comentario a eliminar', example: 1 },
        ],
        responses: {
          200: { description: 'Comentario eliminado exitosamente' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { description: 'Error al eliminar el comentario' },
        },
      },
    },

    // ── REACTIONS ──────────────────────────────────────────────────────────
    '/reaction/create': {
      post: {
        tags: ['Reactions'],
        summary: 'Crear reacción',
        description: 'Registra un like u otra reacción en un post o comentario. Un usuario solo puede reaccionar una vez por contenido.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateReactionBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Reacción creada',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/Reaction' } },
            },
          },
          400: { description: 'El usuario ya ha reaccionado a este contenido' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/reaction/delete/{reactionId}': {
      delete: {
        tags: ['Reactions'],
        summary: 'Eliminar reacción',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'reactionId', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'Reacción eliminada', content: { 'application/json': { example: { message: 'Reacción eliminada exitosamente' } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { description: 'Reacción no encontrada o no autorizada' },
        },
      },
    },

    '/reaction/post/{postId}': {
      get: {
        tags: ['Reactions'],
        summary: 'Obtener reacciones de un post',
        parameters: [
          { name: 'postId', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: {
            description: 'Lista de reacciones',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Reaction' } } } },
          },
        },
      },
    },

    '/reaction/comment/{commentId}': {
      get: {
        tags: ['Reactions'],
        summary: 'Obtener reacciones de un comentario',
        parameters: [
          { name: 'commentId', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'Lista de reacciones del comentario' },
        },
      },
    },

    '/reaction/user/{userId}': {
      get: {
        tags: ['Reactions'],
        summary: 'Obtener reacciones de un usuario',
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'Todas las reacciones del usuario' },
        },
      },
    },

    // ── CATEGORIES ─────────────────────────────────────────────────────────
    '/category/getCategory': {
      get: {
        tags: ['Categories'],
        summary: 'Obtener todas las categorías',
        description: 'No requiere autenticación.',
        responses: {
          200: {
            description: 'Lista de categorías',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
              },
            },
          },
        },
      },
    },

    '/category/searchCategory': {
      get: {
        tags: ['Categories'],
        summary: 'Buscar categoría',
        parameters: [
          { name: 'name', in: 'query', required: false, schema: { type: 'string' }, example: 'Unity' },
        ],
        responses: {
          200: { description: 'Resultados de búsqueda' },
        },
      },
    },

    '/category/getPostsByCategory/{categoryName}': {
      get: {
        tags: ['Categories'],
        summary: 'Obtener posts de una categoría',
        parameters: [
          { name: 'categoryName', in: 'path', required: true, schema: { type: 'string' }, example: 'Unity' },
        ],
        responses: {
          200: { description: 'Posts de la categoría' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/category/createCategory': {
      post: {
        tags: ['Categories'],
        summary: 'Crear categoría',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'Unity' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Categoría creada' },
          400: { description: 'Error de validación' },
        },
      },
    },

    '/category/addPostsToCategory': {
      post: {
        tags: ['Categories'],
        summary: 'Agregar posts a una categoría',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  categoryName: { type: 'string', example: 'Unity' },
                  postIds: { type: 'array', items: { type: 'integer' }, example: [1, 2] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Posts agregados a la categoría' },
        },
      },
    },

    '/category/deletePostsFromCategory': {
      delete: {
        tags: ['Categories'],
        summary: 'Remover posts de una categoría',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  categoryName: { type: 'string', example: 'Unity' },
                  postIds: { type: 'array', items: { type: 'integer' }, example: [1] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Posts removidos de la categoría' },
        },
      },
    },

    '/category/deleteCategory': {
      delete: {
        tags: ['Categories'],
        summary: 'Eliminar una categoría',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'Unity' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Categoría eliminada' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ── NOTIFICATIONS ──────────────────────────────────────────────────────
    '/notifications/': {
      get: {
        tags: ['Notifications'],
        summary: 'Obtener todas las notificaciones (paginadas)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, required: false },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 }, required: false },
        ],
        responses: {
          200: {
            description: 'Lista paginada de notificaciones',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'success' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/notifications/unread': {
      get: {
        tags: ['Notifications'],
        summary: 'Obtener notificaciones no leídas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Notificaciones no leídas' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/notifications/read-all': {
      put: {
        tags: ['Notifications'],
        summary: 'Marcar todas las notificaciones como leídas',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Todas las notificaciones marcadas como leídas' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    '/notifications/{id}/read': {
      put: {
        tags: ['Notifications'],
        summary: 'Marcar notificación como leída',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'Notificación marcada como leída' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Eliminar notificación',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 1 },
        ],
        responses: {
          200: { description: 'Notificación eliminada' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Función de montaje — úsala en run_server.js
// ─────────────────────────────────────────────────────────────────────────────
function setupSwagger(app) {
  const options = {
    customSiteTitle: 'SIV API Docs',
    customCss: `
      .topbar { background-color: #0a0a0a; }
      .topbar-wrapper img { display: none; }
      .topbar-wrapper::after {
        content: 'SIV Blog API';
        color: #05f29b;
        font-weight: bold;
        font-size: 1.2rem;
        font-family: monospace;
      }
      .swagger-ui .info .title { color: #05f29b; }
    `,
    swaggerOptions: {
      persistAuthorization: true, // mantiene el token al recargar
    },
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

  // También expone el JSON crudo para integraciones (Postman, Insomnia, etc.)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📄 Swagger UI disponible en: http://localhost:' + (process.env.PORT || 3000) + '/api-docs');
}

module.exports = { setupSwagger, swaggerSpec };
