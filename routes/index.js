var express = require('express');
var router = express.Router();

var mysql_dbc = require('../db/db_con')();
var pool = mysql_dbc.init_pool();

var passport = require('passport');
var auth = require('../auth/auth-passport');

var url = require('url');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express', navbar: true, auth: req.isAuthenticated(), user: req.user});
});

//로그인
router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Login', navbar: false, auth: req.isAuthenticated()});
});

// router.post('/login', passport.authenticate('local', {
//         successRedirect : previous_page?previous_page:'/',
//         failureRedirect: '/login',
//         failureFlash: true
//     }), function (req, res) {
//         res.redirect(req.headers.referer);
// });

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/login'); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
        });
    })(req, res, next);
});

//로그인
router.get('/popup/login', function (req, res, next) {
    res.render('login', {title: 'Login', navbar: false, auth: req.isAuthenticated()});
});

router.post('/popup/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.redirect('/popup/login'); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.render('refresh');
        });
    })(req, res, next);
});

router.get('/auth/kakao', passport.authenticate('kakao'));
router.get('/auth/kakao/callback',
    passport.authenticate('kakao', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);

/*Log out*/
router.get('/logout', function (req, res) {
    req.logout();
    res.redirect(req.headers.referer);
});

//회원가입
router.get('/register', function (req, res, next) {
    res.render('register', {title: 'Register', navbar: false, auth: req.isAuthenticated()});
});

router.post('/register',
    function (req, res, next) {
        pool.getConnection(function (err, connection) {
            if (err)
                throw err;
            else {
                connection.query('INSERT INTO user(id, password, name, email) VALUES (?, ?, ?, ?)', [req.body.id, auth.hash(req.body.password), req.body.username, req.body.email], function (err, result) {
                    connection.release();
                    if (err) {
                        console.log('err :' + err);
                        res.redirect('/register');
                    } else {
                        next();
                    }
                });
            }
        });
    }, function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) { return next(); }
            if (!user) { return res.redirect('/login'); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/');
            });
        })(req, res, next);
    }
);

//마이페이지
router.get('/user/:id', auth.isAuthenticated, function (req, res) {
    console.log(req.params.id);
    res.render('user', {title: 'User', navbar: true, auth: req.isAuthenticated(), user: req.user});
});

module.exports = router;
