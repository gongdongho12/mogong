var express = require('express');
var router = express.Router();
var request = require('request');

var mysql_dbc = require('../db/db_con')();
var pool = mysql_dbc.init_pool();

var url = require('url');

var passport = require('passport');
var auth = require('../auth/auth-passport');

/* GET home page. */
router.get('/', auth.isAuthenticated, function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err)
            throw err;
        else {
            connection.query('(select p.* from project as p inner join team as t on p.id = t.project_id where t.user_id = ?) union (select * from project as p where p.author = ?) order by id desc;', [req.user.id, req.user.id], function (err, my_projects) {
                if (err) {
                    var err = new Error('Not Found');
                    err.status = 404;
                    next(err);
                } else {
                    connection.query('select * from project as p where visible = 1 order by id desc', function (err, all_projects) {
                        if (err) {
                            var err = new Error('Not Found');
                            err.status = 404;
                            next(err);
                        } else {
                            res.render('my_project', {
                                title: '나의 프로젝트',
                                navbar: true,
                                auth: req.isAuthenticated(),
                                user: req.user,
                                all_projects: all_projects,
                                my_projects: my_projects
                            });
                        }
                    });
                }
                connection.release();
            });
        }
    });
});

router.get('/add', auth.isAuthenticated, function (req, res, next) {
    res.render('add_project', {title: '프로젝트 생성', navbar: true, auth: req.isAuthenticated(), user: req.user});
});

/* GET home page. */
router.post('/add', auth.isAuthenticated, function (req, res, next) {
    console.log(req.body.title, req.body.description, req.user.id, req.body.visible);
    pool.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({message: 'Server Fail'});
            throw err;
        } else {
            connection.query('INSERT INTO project (title, description, author, visible) VALUES (?, ?, ?, ?);', [req.body.title, req.body.description, req.user.id, (req.body.visible=='true'?1:0)], function (err, result) {
                // console.log(JSON.stringify(result));
                if (err) {
                    var err = new Error('Not Found');
                    err.status = 404;
                    // next(err);
                    res.status(404).json({message: 'Insert Fail'});
                } else {
                    res.render('refresh', {url: '/project/' + result.insertId});
                }
                connection.release();
            });
        }
    });
});

router.get('/:id', auth.isAuthenticated, function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err)
            throw err;
        else {
            connection.query('select (select count(*) from team where project_id = ? and user_id = ?) + (select count(*) from project where id = ? and author = ?) as count', [req.params.id, req.user.id, req.params.id, req.user.id], function (err, result) {
                if (err) {
                    var err = new Error('Not Found');
                    err.status = 404;
                    next(err);
                } else {
                    console.log(JSON.stringify(result));
                    if(result[0].count >= 1) {
                        next();
                    } else {
                        // res.status(404).json({message: '가입된 사용자가 아닙니다.'});
                        console.log()
                        connection.query('INSERT INTO team (project_id, user_id, type) VALUES (?, ?, ?);', [req.params.id, req.user.id, 1], function (err, results) {
                            if (err) {
                                var err = new Error('Not Found');
                                err.status = 404;
                                // next(err);

                                res.status(404).json({message: 'Server Fail'});
                            } else {
                                next();
                            }
                        });
                    }
                    connection.release();
                }
            });
        }
    });
}, function (req, res, next) {
    pool.getConnection(function (err, connection) {
        if (err)
            throw err;
        else {
            connection.query('select p.*, u.email, u.name, u.table_url from project as p inner join user as u on u.id = p.author where p.id = ?', req.params.id, function (err, result) {
                if (err) {
                    var err = new Error('Not Found');
                    err.status = 404;
                    next(err);
                } else {
                    console.log(JSON.stringify(result));
                    connection.query('select t.*, u.name, u.email, u.table_url from team as t inner join user as u on u.id = t.user_id where project_id = ?', req.params.id, function (err, teams) {
                        if (err) {
                            var err = new Error('Not Found');
                            err.status = 404;
                            next(err);
                        } else {
                            res.render('project', {
                                title: result.title,
                                navbar: true,
                                auth: req.isAuthenticated(),
                                user: req.user,
                                teams: teams,
                                result: result[0]
                            });
                        }
                    });
                }
                connection.release();
            });
        }
    });
});

router.post('/:id/team', function (req, res, next) {
    console.log(req.params.id, req.body.user_id);
    pool.getConnection(function (err, connection) {
        if (err) {
            res.status(500).json({message: 'Server Fail'});
            // res.redirect('/board/write/' + req.params.id);
            throw err;
        } else {
            connection.query('INSERT INTO team (project_id, user_id, type) VALUES (?, ?, ?);', [req.params.id, req.body.user_id, 1], function (err, results) {
                if (err) {
                    var err = new Error('Not Found');
                    err.status = 404;
                    // next(err);

                    res.status(404).json({message: 'Server Fail'});
                } else {
                    res.redirect('/project/' + req.params.id);
                }
            });
        }
    });
});

router.post('/:id/calculate', function (req, res, next) {
    console.log(JSON.stringify(req.body.table_url));
    request.post({
        url: 'http://172.16.0.40:8000/api',
        json: true,
        form: req.body.table_url
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(JSON.stringify(body));
        }
        res.send('test');
    });
    // res.redirect('/project/' + req.params.id);
});


// /* GET home page. */
// router.get('/write', auth.isAuthenticated, function (req, res, next) {
//     res.render('board_write', {title: '게시판 작성', navbar: true, auth: req.isAuthenticated(), user: req.user, result: {}});
// });
//
// /* GET home page. */
// router.post('/write', auth.isAuthenticated, function (req, res, next) {
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             res.status(500).json({message: 'Server Fail'});
//             throw err;
//         } else {
//             connection.query('INSERT INTO board (title, author, contents) VALUES (?, ?, ?);', [req.body.title, req.user.id, req.body.contents], function (err, result) {
//                 // console.log(JSON.stringify(result));
//                 if (err) {
//                     var err = new Error('Not Found');
//                     err.status = 404;
//                     // next(err);
//                     res.status(404).json({message: 'Insert Fail'});
//                 } else {
//                     res.render('refresh', {url: '/board/' + result.insertId});
//                 }
//                 connection.release();
//             });
//         }
//     });
// });
//
// router.get('/write/:id', auth.isAuthenticated, function (req, res, next) {
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             res.status(500).json({message: 'Server Fail'});
//             throw err;
//         } else {
//             connection.query('SELECT * FROM board WHERE id = ?', req.params.id, function (err, result) {
//                 if (err) {
//                     var err = new Error('Not Found');
//                     err.status = 404;
//                     // next(err);
//                     res.status(404).json({message: 'Server Fail'});
//                 } else {
//                     console.log(JSON.stringify(result));
//                     if (result[0].author == req.user.id) {
//                         res.render('board_write', {
//                             title: '게시판 수정',
//                             navbar: true,
//                             auth: req.isAuthenticated(),
//                             user: req.user,
//                             result: result[0]
//                         });
//                     } else {
//                         res.status(404).json({message: 'Not Authenticated'});
//                     }
//                 }
//                 connection.release();
//             });
//         }
//     });
// });
//
// router.post('/write/:id', auth.isAuthenticated, function (req, res, next) {
//     console.log(req.body);
//     console.log(req.params.id);
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             res.status(500).json({message: 'Server Fail'});
//             // res.redirect('/board/write/' + req.params.id);
//             throw err;
//         } else {
//             connection.query('SELECT * FROM board WHERE id = ?', req.params.id, function (err, results) {
//                 if (err) {
//                     var err = new Error('Not Found');
//                     err.status = 404;
//                     console.log('err :' + err);
//                     connection.release();
//                     res.status(404).json({message: 'Server Fail'});
//                 } else {
//                     if (results[0].author == req.user.id) {
//                         connection.query('UPDATE board SET title = ?, contents = ? WHERE id = ?;', [req.body.title, req.body.contents, req.params.id], function (err, result) {
//                             if (err) {
//                                 var err = new Error('Not Found');
//                                 err.status = 404;
//                                 console.log('err :' + err);
//                                 res.status(404).json({message: 'Update Fail'});
//                                 // res.redirect('/board/write/' + req.params.id);
//                             } else {
//                                 res.render('refresh');
//                             }
//                             connection.release();
//                         });
//                     } else {
//                         res.status(404).json({message: 'Not Authenticated'});
//                         connection.release();
//                     }
//                 }
//             });
//         }
//     });
// });
//
// router.post('/delete/:id', auth.isAuthenticated, function (req, res, next) {
//     console.log(req.body);
//     console.log(req.params.id);
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             res.status(500).json({message: 'Server Fail'});
//             // res.redirect('/board/write/' + req.params.id);
//             throw err;
//         } else {
//             connection.query('SELECT * FROM board WHERE id = ?', req.params.id, function (err, results) {
//                 if (err) {
//                     var err = new Error('Not Found');
//                     err.status = 404;
//                     // next(err);
//                     res.status(404).json({message: 'Server Fail'});
//                 } else {
//                     if (results[0].author == req.user.id) {
//                         connection.query('DELETE FROM board WHERE id = ?;', req.params.id, function (err, result) {
//                             if (err) {
//                                 var err = new Error('Not Found');
//                                 err.status = 404;
//                                 console.log('err :' + err);
//                                 // res.json(404, {status:'fail'});
//                                 // res.redirect('/board/write/' + req.params.id);
//                                 res.status(404).json({message: 'Update Fail'});
//                             } else {
//                                 res.redirect('/board');
//                             }
//                             connection.release();
//                         });
//                     } else {
//                         res.status(404).json({message: 'Not Authenticated'});
//                         connection.release();
//                     }
//                 }
//             });
//         }
//     });
// });
//
// /* GET home page. */
// router.get('/:id', function (req, res, next) {
//     pool.getConnection(function (err, connection) {
//         if (err)
//             throw err;
//         else {
//             connection.query('SELECT b.*, u.name FROM board as b inner join user as u on b.author = u.id WHERE b.id = ? order by b.id desc', req.params.id, function (err, results) {
//                 if (err) {
//                     var err = new Error('Not Found');
//                     err.status = 404;
//                     next(err);
//                 } else {
//                     console.log(JSON.stringify(results));
//                     connection.query('SELECT r.*, u.name FROM review as r INNER JOIN user as u ON r.board_id = ? and r.author = u.id ORDER BY r.id DESC', req.params.id, function (err, review_results) {
//                         if (err) {
//                             var err = new Error('Not Found');
//                             err.status = 404;
//                             next(err);
//                         } else {
//                             console.log(JSON.stringify(review_results));
//                             res.render('board_read', {
//                                 title: '게시판',
//                                 navbar: true,
//                                 auth: req.isAuthenticated(),
//                                 user: req.user,
//                                 result: results[0],
//                                 review_results: review_results
//                             });
//                         }
//                         connection.release();
//                     });
//                 }
//             });
//         }
//     });
// });
//
// /* 리뷰 작성 */
// router.post('/review/write', auth.isAuthenticated, function (req, res, next) {
//     var paths = url.parse(req.headers.referer).path.split('/');
//     // res.sendStatus(200);
//
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             res.status(500).json({message: 'server error'});
//             throw err;
//         } else {
//             connection.query('INSERT INTO review (board_id, author, contents) VALUES (?, ?, ?)', [paths[paths.length - 1], req.user.id, req.body.message], function (err, results) {
//                 connection.release();
//                 if (err) {
//                     console.log('err :' + err);
//                     res.status(404).json({message: 'fail'});
//                 } else {
//                     res.json({message: 'success'});
//                 }
//             });
//         }
//     });
// });
//
// // router.post('/review/delete', auth.isAuthenticated, function (req, res, next) {
// //
// // });
//
// router.post('/review/delete', auth.isAuthenticated, function (req, res, next) {
//     pool.getConnection(function (err, connection) {
//         if (err) {
//             res.status(500).json({status: 'server error'});
//             throw err;
//         } else {
//             connection.query('SELECT * FROM review WHERE author = ?', req.user.id, function (err, review_results) {
//                 if (err) {
//                     var err = new Error('Not Found');
//                     err.status = 404;
//                     next(err);
//                 } else {
//                     if (review_results.length > 0) {
//                         connection.query('DELETE FROM review WHERE id = ?;', req.body.id, function (err, results) {
//                             if (err) {
//                                 console.log('err :' + err);
//                                 res.status(404).json({message: 'fail'});
//                             } else {
//                                 res.json({message: 'success'});
//                             }
//                             connection.release();
//                         });
//                     } else {
//                         console.log('err :' + err);
//                         res.status(404).json({message: 'Not Authenticated'});
//                         connection.release();
//                     }
//                 }
//             });
//         }
//     });
// });

module.exports = router;
