const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUI = require('swagger-ui-express');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
dotenv.config();
// Router
const usersRouter = require('./routes/users');
const statAPIRouter = require('./routes/statApi');
const authenticateROUTER = require('./routes/authenticate.js');
const coreAPIRouter = require('./routes/coreApi.js');
const adminAPIRouter = require('./routes/admin');
const { verifyToken } = require('./utils/validation');
const app = express();

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'List of API',
            version: '1.0.0',
            description: 'A list of api',
        },
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsDoc(options);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/documentation', swaggerUI.serve, swaggerUI.setup(specs));
app.use('/users',verifyToken, usersRouter);
app.use('/stat', statAPIRouter);
app.use('/', authenticateROUTER);
app.use('/both', coreAPIRouter);
app.use('/admin', adminAPIRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

require('./cores/mqtt_rel');

module.exports = app;
