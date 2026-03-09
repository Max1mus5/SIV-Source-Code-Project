const express = require('express');
const path    = require('path');
const cors    = require('cors');

const { sequelize }       = require('../../connection/db/database');
const userRoutes          = require('../../modules/user/routes/userRoutes');
const resetPasswordRoutes = require('../../modules/user/routes/recoverPassword');
const postRoutes          = require('../../modules/posts/routes/postsRouters');
const commentRoutes       = require('../../modules/comments/routes/commentsRouter');
const categoryRoutes      = require('../../modules/category/routes/categoryRouter');
const reactionRoutes      = require('../../modules/reactions/routes/reactionRouter');
const notificationRoutes  = require('../../modules/notifications/routes/notificationRouter');

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use(async (req, res, next) => {
    try {
        await sequelize.authenticate();
        next();
    } catch {
        res.status(503).json({ error: 'Database service unavailable' });
    }
});

app.use('/user',          userRoutes);
app.use('/reset',         resetPasswordRoutes);
app.use('/post',          postRoutes);
app.use('/comments',      commentRoutes);
app.use('/category',      categoryRoutes);
app.use('/reaction',      reactionRoutes);
app.use('/notifications', notificationRoutes);

app.get('/status', (_req, res) => {
    res.json({ status: 'OK', message: 'Backend Service is running' });
});

app.use((err, _req, res, _next) => {
    res.status(err.status || 500).json({
        error: { message: err.message || 'Internal server error', status: err.status || 500 }
    });
});

app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Route not found', status: 404 } });
});

module.exports = app;
