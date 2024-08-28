const express = require('express');
const app = express();
const userRoutes = require('./modules/user/routes/userRoutes');
const resetPasswordRoutes = require('./modules/user/routes/recoverPassword');
const postRoutes = require('./modules/posts/routes/postsRouters');
const { sequelize } = require('./connection/db/database');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());
app.use(cors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: false, 
}));
app.use('/user', userRoutes);
app.use('/reset', resetPasswordRoutes);
app.use('/post', postRoutes);


const port = process.env.PORT || 3000;

app.get('/status', (req, res) => {
    let status = {
        status: 'OK',
        message: 'Backend Service is running'
    };
    res.json(status);
});

app.listen(port, async () => {
    try{
        await sequelize.sync({ alter: true });
        console.log(`${process.env.baseURL}:${port}`);
    }
    catch(err){
        console.log(err);
    }
    
});

//#region Blockchain Server
const blockchainApp = express(); //otra instancia de express para el servicio de blockchain

blockchainApp.use(express.json());
blockchainApp.use(cors({
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: false, // allow session cookie from browser to pass through
})
)
blockchainApp.use('/blockchain', require('./connection/blockchain/blockchainRouter'));

const blockchainPort = process.env.BC_PORT || 3001;

blockchainApp.get('/status', (req, res) => {
    let status = {
        status: 'OK',
        message: 'Blockchain Service is running'
    };
    res.json(status);
});

blockchainApp.listen(blockchainPort, () => {
    console.log(`Blockchain Service running at ${process.env.baseURL}:${blockchainPort}`);
});
/* Montar blockchain en paralelo */
const blockchainService = require('./connection/blockchain/blockchainInstance');
const cron = require('node-cron'); // Librería para programar tareas, en este caso cada 7 días se hará el proceso de re-montar el blockchain

async function mountBlockchain() {
    try {
        console.log('\x1b[31m%s\x1b[0m', 'Mounting blockchain...');
        // Buscar en la base de datos todos los posts y pasarlos como arreglo a mountBlockchain
        const posts = await sequelize.query('SELECT * FROM posts', { type: sequelize.QueryTypes.SELECT });

        let result = await blockchainService.mountBlockchain(posts);
        console.log(result);

        console.log('\x1b[31m%s\x1b[0m', 'Blockchain mounted successfully.');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error mounting blockchain:', error);
    }
}

// Montar blockchain inmediatamente al iniciar el componente
mountBlockchain();

// Programar la tarea para que se ejecute cada 7 días a las 00:00
cron.schedule('0 0 * * 0', mountBlockchain);


//#endregion
