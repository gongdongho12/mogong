var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var KakaoStrategy = require('passport-kakao').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var mysql_dbc = require('../db/db_con')();
var secret = require('../commons/secret');
var pool = mysql_dbc.init_pool();
var bcrypt = require('bcrypt');
var url = require('url');

var exports = module.exports = {};

exports.isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    else
        if(req.params.repetition >= 1)
            res.redirect('/');
        else
            res.render('open_popup');
}

exports.hash = function(data) {
    return bcrypt.hashSync(data, bcrypt.genSaltSync(10));
}

exports.sns_auth = function (type, profile, done) {
    pool.getConnection(function(err, connection) {
        if (err) {
            throw err;
            return done(false, null);
        } else {
            connection.query('select * from `user` where `id` = ?', profile.id, function (err, result1) {
                if (err) {
                    console.log('err :' + err);
                    connection.release();
                    return done(false, null);
                } else {
                    if (result1.length === 0) {
                        connection.query('insert into user(id, name, email, auth_type) VALUES (?, ?, ?, ?)', [profile.id, profile.properties.nickname, profile.kaccount_email, type], function (err, result2) {
                            if (err) {
                                connection.release();
                                console.log('err :' + err);
                                return done(false, null);
                            } else {
                                connection.query('select * from `user` where `id` = ?', profile.id, function (err, result3) {
                                    connection.release();
                                    if (err) {
                                        console.log('err :' + err);
                                        return done(false, null);
                                    } else {
                                        return done(null, {
                                            id: result3[0].id,
                                            username: result3[0].name,
                                            email: result3[0].email,
                                            signup_date: result3[0].signup_date
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        connection.release();
                        return done(null, {
                            id: result1[0].id,
                            username: result1[0].name,
                            email: result1[0].email,
                            signup_date: result1[0].signup_date
                        });
                    }
                }
            });
        }
    });
}

exports.init = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    /*로그인 성공시 사용자 정보를 Session에 저장한다*/
    passport.serializeUser(function (user, done) {
        done(null, user)
    });

    /*인증 후, 페이지 접근시 마다 사용자 정보를 Session에서 읽어옴.*/
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use(new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password',
        passReqToCallback: true //인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
    }, function (req, id, password, done) {
        pool.getConnection(function(err, connection) {
            if (err)
                throw err;
            else {
                connection.query('select * from `user` where `id` = ?', id, function (err, result) {
                    connection.release();
                    if (err) {
                        console.log('err :' + err);
                        return done(false, null);
                    } else {
                        if (result.length === 0) {
                            console.log('해당 유저가 없습니다');
                            return done(false, null);
                        } else {
                            if (!bcrypt.compareSync(password, result[0].password)) {
                                console.log('패스워드가 일치하지 않습니다');
                                return done(false, null);
                            } else {
                                console.log('로그인 성공');
                                return done(null, {
                                    id: result[0].id,
                                    username: result[0].name,
                                    email: result[0].email,
                                    signup_date: result[0].signup_date
                                });
                            }
                        }
                    }
                });
            }
        });
    }));

    passport.use(new KakaoStrategy({
            clientID: secret.kakao.client_id,
            clientSecret: secret.kakao.secret_id,
            callbackURL: secret.kakao.callback_url
        },
        function (accessToken, refreshToken, profile, done) {
            var _profile = profile._json;
            console.log(JSON.stringify(_profile));
            exports.sns_auth('kakao', _profile, done);
        }
    ));

    passport.use(new FacebookStrategy({
            clientID: secret.facebook.client_id,
            clientSecret: secret.facebook.secret_id,
            callbackURL: secret.facebook.callback_url,
            profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone',
                'updated_time', 'verified', 'displayName']
        }, function (accessToken, refreshToken, profile, done) {
            // var _profile = profile._json;
            console.log(JSON.stringify(profile));
            //
            // loginByThirdparty({
            //     'auth_type': 'facebook',
            //     'auth_id': _profile.id,
            //     'auth_name': _profile.name,
            //     'auth_email': _profile.id
            // }, done);
        }
    ));
}