const express = require('express');
const app = express();
const userRoutes = require('./modules/user/routes/userRoutes');
const resetPasswordRoutes = require('./modules/user/routes/recoverPassword');
const postRoutes = require('./modules/posts/routes/postsRouters');
const commentRoutes = require('./modules/comments/routes/commentsRouter');
const categoryRoutes = require('./modules/category/routes/categoryRouter');
const { sequelize } = require('./connection/db/database');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Middleware para logging de solicitudes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Middleware para parsing de JSON con manejo de errores
app.use(express.json({
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ error: 'Invalid JSON' });
            throw new Error('Invalid JSON');
        }
    }
}));

// Configuración de CORS con manejo de errores
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
    optionsSuccessStatus: 200
}));

// Middleware para verificar la conexión a la base de datos
app.use(async (req, res, next) => {
    try {
        await sequelize.authenticate();
        next();
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(503).json({ error: 'Database service unavailable' });
    }
});

// Rutas principales con manejo de errores
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

app.use('/user', asyncHandler(async (req, res, next) => {
    if (!userRoutes) throw new Error('User routes not properly initialized');
    return userRoutes(req, res, next);
}));

app.use('/reset', asyncHandler(async (req, res, next) => {
    if (!resetPasswordRoutes) throw new Error('Reset password routes not properly initialized');
    return resetPasswordRoutes(req, res, next);
}));

app.use('/post', asyncHandler(async (req, res, next) => {
    if (!postRoutes) throw new Error('Post routes not properly initialized');
    return postRoutes(req, res, next);
}));

app.use('/comments', asyncHandler(async (req, res, next) => {
    if (!commentRoutes) throw new Error('Comment routes not properly initialized');
    return commentRoutes(req, res, next);
}));

app.use('/category', asyncHandler(async (req, res, next) => {
    if (!categoryRoutes) throw new Error('Category routes not properly initialized');
    return categoryRoutes(req, res, next);
}));

const port = process.env.PORT || 3000;

app.get('/status', (req, res) => {
    let status = {
        status: 'OK',
        message: 'Backend Service is running',
        dbStatus: sequelize.authenticate().then(() => 'Connected').catch(() => 'Disconnected')
    };
    res.json(status);
});

// Middleware global para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            status: err.status || 500,
            timestamp: new Date().toISOString()
        }
    });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            status: 404,
            path: req.originalUrl
        }
    });
});

const startServer = async () => {
    try {
        await sequelize.query('DROP TABLE IF EXISTS `Users_backup`');
        await sequelize.sync({ alter: true });
        app.listen(port, () => {
            console.log(`${process.env.baseURL}:${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

//#region Blockchain Server
const blockchainApp = express();

// Middleware de logging para blockchain
blockchainApp.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - Blockchain - ${req.method} ${req.path}`);
    next();
});

blockchainApp.use(express.json());
blockchainApp.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
    optionsSuccessStatus: 200
}));

blockchainApp.use('/blockchain', require('./connection/blockchain/blockchainRouter'));

const blockchainPort = process.env.BC_PORT || 3001;

blockchainApp.get('/status', (req, res) => {
    let status = {
        status: 'OK',
        message: 'Blockchain Service is running'
    };
    res.json(status);
});

// Middleware de manejo de errores para blockchain
blockchainApp.use((err, req, res, next) => {
    console.error('Blockchain error:', err);
    res.status(500).json({
        error: {
            message: 'Blockchain service error',
            details: err.message
        }
    });
});

const blockchainService = require('./connection/blockchain/blockchainInstance');
const cron = require('node-cron');

async function mountBlockchain() {
    try {
        console.log('\x1b[31m%s\x1b[0m', 'Mounting blockchain...');
        const posts = await sequelize.query('SELECT * FROM posts', { type: sequelize.QueryTypes.SELECT });

        let result = await blockchainService.mountBlockchain(posts);
        console.log(result);

        console.log('\x1b[31m%s\x1b[0m', 'Blockchain mounted successfully.');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error mounting blockchain:', error);
        // Reintentar en 5 minutos si falla
        setTimeout(mountBlockchain, 300000);
    }
}

// Iniciar servicios
const startServices = async () => {
    try {
        await startServer();
        
        blockchainApp.listen(blockchainPort, () => {
            console.log(`Blockchain Service running at ${process.env.baseURL}:${blockchainPort}`);
        });

        await mountBlockchain();
        cron.schedule('0 0 * * 0', mountBlockchain);
    } catch (error) {
        console.error('Failed to start services:', error);
        process.exit(1);
    }
};

startServices();
//#endregion