var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var cookieSession = require('cookie-session');
var flash = require('connect-flash');

// Router
var index = require('./routes/index');
var api = require('./routes/api');
var board = require('./routes/board');

var auth = require('./auth/auth-passport');
// var passport = require('passport');
// var LocalStrategy = require('passport-local').Strategy;
// var mysql_dbc = require('./db/db_con')();
// var pool = mysql_dbc.init_pool();
// var bcrypt = require('bcrypt');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules'))); // 노드모듈 디렉토토리 추가

app.use(cookieSession({
    keys: ['dongho_lab'],
    cookie: {
        maxAge: 100 * 60 * 60 // 쿠키 유효기간 1시간
    }
}));
app.use(flash());

//인증시스템 분산
auth.init(app);

app.use('/', index);
app.use('/api/v1', api);
app.use('/board', board);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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

module.exports = app;
