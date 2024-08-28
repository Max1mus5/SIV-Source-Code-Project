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
/* montar blockchain en en paralelo */
let BlockchainService = require('./connection/blockchain/blockchainServices');

(async () => {
    try {
        
        console.log('Mounting blockchain...\n\n\n\n');
        /* buscar en la base de datos en posts todos los post y pasarlo como arreglo a mountblockchain */
        const posts = await sequelize.query('SELECT * FROM posts', { type: sequelize.QueryTypes.SELECT });
        let blockchainService = new BlockchainService();
        await blockchainService.mountBlockchain(posts);
        console.log('Blockchain mounted successfully.');
    } catch (error) {
        console.error('Error mounting blockchain:', error);
    }
})();

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
//#endregion
