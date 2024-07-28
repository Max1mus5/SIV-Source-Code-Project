const express = require('express');
const app = express();
const userRoutes = require('./modules/user/routes/userRoutes');
const { sequelize } = require('./connection/db/database');
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());
app.use('/user', userRoutes);

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
        console.log(`http://localhost:${port}`);
    }
    catch(err){
        console.log(err);
    }
    
});
