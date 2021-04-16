const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;

app.use(express.urlencoded({
    extended: true
}));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/url', function(req, res) {
    const url = req.body.url;

    res.send(url);
});

app.listen(port, () => console.log(`smart contract inspector listening on port ${port}!`));