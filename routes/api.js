/**
 * Created by cheese on 2017. 1. 6..
 */

var express = require('express');
var router = express.Router();
var mysql_dbc = require('../db/db_con')();
var connection = mysql_dbc.init();
var bcrypt = require('bcrypt');

router.post('/login', function (req, res, next) {
    var id = req.body.id;
    var password = req.body.password;

    connection.query('select * from `user` where `id` = ?', id, function (err, result) {
        if (err) {
            console.log('err :' + err);
            console.log('err');
        } else {
            if (result.length === 0) {
                res.json({success: false, msg: '해당 유저가 존재하지 않습니다.'});
            } else {
                if (!bcrypt.compareSync(password, result[0].password)) {
                    res.json({success: false, msg: '비밀번호가 일치하지 않습니다.'});
                } else {
                    res.json({success: true});
                }
            }
        }
    });
});

router.post('/register/id', function (req, res, next) {
    var id = req.body.id;

    connection.query('select * from `user` where `id` = ?', id, function (err, result) {
        if (err) {
            console.log('err :' + err);
            console.log('err');
        } else {
            if (result.length === 0) {
                res.json({success: true, msg: '이 아이디는 사용하셔도 좋습니다.'});
            } else {
                res.json({success: false, msg: '중복된 아이디 입니다.'});
            }
        }
    });
});

module.exports = router;