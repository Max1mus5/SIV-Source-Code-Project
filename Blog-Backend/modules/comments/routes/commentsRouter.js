const express = require('express');
const router = express.Router();
const CommentController = require('../controller/commentController');
const { authenticateToken } = require('../../../connection/middlewares/JWTmiddleware');

// Ruta para crear un nuevo comentario
router.post('/', authenticateToken, async (req, res) => { 
    const commentController = new CommentController();
    try {
        const newComment = await commentController.createComment(req.body);
        res.status(201).json({ 
            status: 'success',
            data: newComment 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al crear el comentario' 
        });
    }
});

// Ruta para obtener los comentarios de una publicación
router.get('/:post_id', async (req, res) => { 
    const commentController = new CommentController();
    try {
        const comments = await commentController.getComments(req.params.post_id);
        res.status(200).json({ 
            status: 'success', 
            data: comments 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al obtener los comentarios' 
        });
    }
});

// Ruta para eliminar un comentario
router.delete('/:comment_id', authenticateToken, async (req, res) => { 
    const commentController = new CommentController();
    try {
        await commentController.deleteComment(req.params.comment_id);
        res.status(200).json({ 
            status: 'success', 
            message: 'Comentario eliminado exitosamente' 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Error al eliminar el comentario' 
        });
    }
});

// Documentación de la API
router.get('/docs', (req, res) => {
    res.json({
        version: '1.0',
        basePath: '/comments',
        endpoints: {
            create: {
                path: '/',
                method: 'POST',
                description: 'Crea un nuevo comentario',
                security: 'Bearer Token',
                requestBody: {
                    content: {
                        'application/json': {
                            schema: {

                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Comentario creado exitosamente' },
                    500: { description: 'Error al crear el comentario' }
                }
            },
            get: {
                path: '/:post_id',
                method: 'GET',
                description: 'Obtiene los comentarios de una publicación',
                parameters: [
                    {
                        name: 'post_id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                responses: {
                    200: { description: 'Comentarios obtenidos exitosamente' },
                    500: { description: 'Error al obtener los comentarios' }
                }
            },
            delete: {
                path: '/:comment_id',
                method: 'DELETE',
                description: 'Elimina un comentario',
                security: 'Bearer Token',
                parameters: [
                    {
                        name: 'comment_id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'string'
                        }
                    }
                ],
                responses: {
                    200: { description: 'Comentario eliminado exitosamente' },
                    500: { description: 'Error al eliminar el comentario' }
                }
            }
        }
    });
});

module.exports = router;