const express = require('express');
const app = express();

app.use('/templates', express.static('templates'));
app.use('/styles', express.static('styles'));
app.use('/webfonts', express.static('webfonts'));
app.use('/scripts', express.static('scripts'));
app.use('/images', express.static('images'));

app.get("/*", (req, res)=>{
    res.sendFile("index.html", { root: __dirname });
})

module.exports = app;