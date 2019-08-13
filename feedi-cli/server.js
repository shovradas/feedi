const http = require('http');
const util = require('util');
const app = require('./app');

const port = process.env.PORT;
const server = http.createServer(app);
server.listen(port, ()=>{
    console.log(
        util.format("Server started@ %s:%s",
        process.env.HOST,
        process.env.PORT
    ));
});