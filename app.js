const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// Router
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const statAPIRouter = require('./routes/statApi');
const authenticateROUTER = require('./routes/authenticate.js');
const coreAPIRouter = require('./routes/coreApi.js');
const adminAPIRouter = require('./routes/admin');

const app = express();
const { auth, requiresAuth } = require('express-openid-connect');
app.use(
    auth({
        authRequired: false,
        auth0Logout: true,
        issuerBaseURL: process.env.ISSUER_BASE_URL,
        baseURL: process.env.BASE_URL,
        clientID: process.env.CLIENT_ID,
        secret: process.env.SECRET,
    })
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', requiresAuth(), usersRouter);
// app.use('/api/stat', requiresAuth(), statAPIRouter);
// app.use('/api/authenticate', requiresAuth(), authenticateROUTER);
// app.use('/api/core', requiresAuth(), coreAPIRouter);
// app.use('/api/admin', requiresAuth(), adminAPIRouter);
app.use('/users',  usersRouter);
app.use('/api/stat', statAPIRouter);
app.use('/api/authenticate', authenticateROUTER);
app.use('/api/core', coreAPIRouter);
app.use('/api/admin', adminAPIRouter);
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
