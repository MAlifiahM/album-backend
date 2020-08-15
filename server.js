const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const port = 8888;
const routeApi = require('./api/routes/api');
const app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/', routeApi);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
