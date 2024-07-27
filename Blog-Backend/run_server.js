const express = require('express');
const app = express();
const port = 3000;

app.get('/status', (req, res) => {
    let status = {
        status: 'OK',
        message: 'Backend Service is running'
    };
    res.json(status);
});

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});
