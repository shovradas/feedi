const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const userRoutes = require('./api/routes/users');
const feedRoutes = require('./api/routes/feeds');
const entryRoutes = require('./api/routes/entries');

// mongoose.connect(
//     'mongodb+srv://node-shop:' +
//     process.env.DB_PW +    
//     '@node-rest-shop-o6gf3.mongodb.net/' + process.env.DB_NAME + '?retryWrites=true&w=majority', 
//     {
//         useNewUrlParser: true,
//         useCreateIndex: true
//     }
// );

mongoose.connect('mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME,
    {
        useNewUrlParser: true,
        useCreateIndex: true
    }
);

app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});


//ROUTES
app.use('/users', userRoutes);
app.use('/feeds', feedRoutes);
app.use('/entries', entryRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

module.exports = app;