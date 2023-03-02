require('dotenv').config();
const UserController = require('../controllers/userController');
const uploadFileMiddleware = require('../middleware/uploadFileMiddleware');
const PROFILE_IMG_PATH = process.env.PROFILE_IMG_PATH;
const crypto = require('node:crypto');
const fs = require('fs');
const mysql = require('mysql2/promise');
const express = require('express');
const path = require('path');
const multer = require('multer');
const mailer = require('./mailer');
const { query } = require('../db');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, PROFILE_IMG_PATH);
    },
    filename: (req, file, cb) => {
        const randomFileName = Math.round(Math.random() * 1E15);
        const ext = path.extname(file.originalname);
        cb(null, randomFileName + ext)
    }
});
const upload = multer({ storage: storage });
const idFormat = /^[\w-]{5,20}$/;
const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;
const usernameFormat = /^[\w|가-힣]{2,10}$/
const todoDbOptions = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_TODO_DATABASE
}
const tokensDbOptions = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_TOKEN_DATABASE
}
const mail = new mailer();
const router = express.Router();

function hashPassword(pswd) {
    try {
        const salt = crypto.randomBytes(128).toString("base64");
        const iterations = 10000;
        const keylen = 128;
        const digest = 'sha512';
        return new Promise((resolve, rejects) => {
            crypto.pbkdf2(pswd, salt, iterations, keylen, digest, (err, derivedKey) => {
                if(err) rejects(err);
                resolve({
                    salt: salt,
                    hash: derivedKey,
                    iterations: iterations
                });
            });
        });
    } catch (error) {
        if(err) throw 'failure encrypt password';
    }
}

router.get('/login', async (req, res) => {
    const kakaoKey = process.env.KAKAO_REST_KEY;
        const naverId = process.env.NAVER_CLIENT_ID;
        const callbackUrl = encodeURI(process.env.AUTH_CALLBACK_URI);
        const state = "random_state";
        let naverApi_url = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" + naverId + '&redirect_uri=' + callbackUrl + "naver" + '&state=' + state;
        let kakaoApi_url = "https://kauth.kakao.com/oauth/authorize?&response_type=code&client_id=" + kakaoKey + '&redirect_uri=' + callbackUrl + "kakao" + '&state=' + state;
        res.render('users/login', {
            "pageTitle": process.env.PAGE_TITLE,
            "naverApi_url": naverApi_url,
            "kakaoApi_url": kakaoApi_url
        });
})

router.post('/login', async (req, res, next) => {
    try {
        if (!idFormat.test(req.body.user_id) || !pswdFormat.test(req.body.password)) throw new Error("Bad Request");
        const usersConnection = await mysql.createConnection(todoDbOptions);
        const [results] = await usersConnection.execute(`SELECT user_id, user_img, username, password_hash, password_salt, password_iter FROM users WHERE user_id = "${req.body.user_id}"`);

        if(results.length > 0) {
            const keylen = 128;
            const digest = 'sha512';
            const pswd = req.body.password;
            const hash = results[0].password_hash;
            const salt = results[0].password_salt.toString();
            const iterations = parseInt(results[0].password_iter.toString());
            const keepLoginAge = 1000000;

            crypto.pbkdf2(pswd, salt, iterations, keylen, digest, async (err, derivedKey) => {
                if(err) throw err;
                if(derivedKey.equals(hash)) {
                    req.session.regenerate( (err) => {
                        if(err) throw err;
                        if(req.body.keepLogin == "true") {
                            req.session.cookie.maxAge = keepLoginAge;
                            req.session.cookie.expries = new Date(Date.now() + keepLoginAge);
                        }
                        req.session.isLogined = true;
                        req.session.user_id = results[0].user_id;
                        req.session.userimg = results[0].user_img;
                        req.session.username = results[0].username;
                        if(!req.session.currentCategory) req.session.currentCategory = "오늘 할 일";
                        req.session.save(async (err) => {
                            if (err) throw err;
                            await usersConnection.end();
                            res.sendStatus(200);
                        });
                    });
                } else {
                    res.sendStatus(404);
                }
            });
        } else {
            await usersConnection.end();
            res.sendStatus(404);
        }
    } catch (error) {
        error.status = 400
        next(error);
    }
});

router.delete('/logout', async (req, res) => {
    await UserController.logoutUser(req, res);
});

// router.use((req, res, next) => {
//     let findUrl = /(?:users\/find_)+/;
//     let joinUrl = /(?:users\/join)+/;
//     let loginUrl = /(?:users\/login\/)/;

//     if(findUrl.test(req.originalUrl) == false && req.session.isLogined == true) {
//         next();
//     } else if(findUrl.test(req.originalUrl) == true && req.session.isLogined == undefined) {
//         next();
//     } else if(joinUrl.test(req.originalUrl) == true && req.session.isLogined == undefined) {
//         next();
//     } else if(loginUrl.test(req.originalUrl) == true && req.session.isLogined == undefined) {
//         next();
//     } else {
//         res.redirect('/');
//     }
// });

router.get('/find_id', (req, res) => {
    res.render('users/find_id', { "pageTitle": process.env.PAGE_TITLE });
});

router.post('/find_id/send', async (req, res) => {
        UserController.getUserByEmail(req, res);
});

router.get('/find_id/results', (req, res) => {
    if(!req.query) {
        res.send('render not joined page');
    } else {
        res.render('find_result', {
            "pageTitle": process.env.PAGE_TITLE,
            "users": req.query.userId,
            "findType": "id"
        });
    }
});

router.get('/find_pswd', (req, res) => {
    res.render('find_pswd', { "pageTitle": process.env.PAGE_TITLE });
});

router.post('/find_pswd/send', async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(todoDbOptions);
        let userquery = `SELECT user_id, email FROM users WHERE user_id = "${req.body.id}" AND email = "${req.body.email}"`;
        const [user] = await usersConnection.execute(userquery);
        if(user.length == 1) {
            const code = crypto.randomBytes(64).toString("base64");
            let expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 1);

            const tokensConnection = await mysql.createConnection(tokensDbOptions);
            let query = 'INSERT INTO reset_password (reset_code, user_id, expire_date) values(?, ?, ?) ON DUPLICATE KEY UPDATE reset_code=?';
            await tokensConnection.execute(query, [code, user[0].user_id, expireDate, code]);

            mail.type = "resetPswd";
            mail.email = user[0].email;
            mail.user_id = user[0].user_id;
            mail.code = code;
            mail.makeForm();
            await mail.send();
            await usersConnection.end();
            await tokensConnection.end();
            res.status(200).send(user[0].email);
        } else {
            await usersConnection.end();
            await tokensConnection.end();
            res.sendStatus(200).send('NotFoundUser');
        }    
    } catch (error) {
        res.sendStatus(500);
    }    
});

router.get('/find_pswd/result', (req, res) => {
    res.render('find_result', {
        "pageTitle": process.env.PAGE_TITLE,
        "users": req.query.users,
        "email": req.query.email,
        "findType": "pswd"
    });
});

router.post('/find_pswd/reset', async (req, res) => {
    try {
        if(pswdFormat.test(req.body.password)) {
            const tokensConnection = await mysql.createConnection(tokensDbOptions);
            const [results] = await tokensConnection.execute(`SELECT user_id FROM reset_password WHERE reset_code = "${req.body.code}"`);
            if(results.length == 1) {
                    const pswd = await hashPassword(req.body.password);
                    const usersConnection = await mysql.createConnection(todoDbOptions);
                    await usersConnection.execute('UPDATE users SET password_hash=?, password_salt=?, password_iter=? WHERE user_id=?', [pswd.hash, pswd.salt, pswd.iterations, results[0].user_id]);
                    await usersConnection.end();
                    await tokensConnection.end();
                    res.status(200).send('OK');
            } else {
                await usersConnection.end();
                await tokensConnection.end();
                res.statusCode(400);
            }
        } else {
            res.statusCode(400);
        } 
    } catch (error) {
        await tokensConnection.end();
        res.statusCode(404);
    }
});

router.get('/find_pswd/auth', async (req, res) => {
    const tokensConnection = await mysql.createConnection(tokensDbOptions);
    const [results] = await tokensConnection.execute(`SELECT user_id FROM reset_password WHERE reset_code = "${req.query.code}"`);
    if(results.length == 1) {
        await tokensConnection.end();
        res.render('users/reset_pswd', { "pageTitle": process.env.PAGE_TITLE });
    } else {
        await tokensConnection.end();
        res.status(200).send('invalidCode');
    }
});

router.get('/join', (req, res) => {
    res.render('users/join', { "pageTitle": process.env.PAGE_TITLE });
});

router.get('/join/verify/:user_id', async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(todoDbOptions);
        const [rows] = await usersConnection.execute(`SELECT user_id FROM users WHERE user_id = "${req.params.user_id}"`);
        if(rows.length > 0) {
            await usersConnection.end();
            res.status(200).send('existinguser_id');
        } else {
            await usersConnection.end();
            res.status(200).send('notExistinguser_id');
        }
    } catch (error) {
        await usersConnection.end();
        res.sendStatus(500);
    }
});

const verifyJoinForm = async (req, res, next) => {
    if (!idFormat.test(req.body.user_id) || !emailFormat.test(req.body.email) || !pswdFormat.test(req.body.password)) {
        res.status(400).send('유효하지 않는 데이터');
    } else {
        const usersConnection = await mysql.createConnection(todoDbOptions);
        const [rows] = await usersConnection.execute(`SELECT user_id FROM users WHERE email = "${req.body.email}"`);
        if(rows.length > 4) {
            await usersConnection.end();
            res.status(200).send('maxJoinedUsers');
        } else {
            const query = `SELECT user_id FROM users WHERE user_id = "${req.body.user_id}"`;
            const [rows] = await usersConnection.execute(query);
            if(rows.length > 0) {
                await usersConnection.end();
                res.status(200).send('existinguser_id');
            } else {
                next();
            }
        }
    }
}

router.post('/join/submit', [verifyJoinForm], async (req, res) => {
    UserController.createUser(req, res);
    // try {
    //     const pswd = await hashPassword(req.body.password);
    //     const code = crypto.randomBytes(64).toString("base64");
    //     let expireDate = new Date();
    //     expireDate.setDate(expireDate.getDate() + 1);
    //     const query = `INSERT INTO auth_join (
    //         auth_code, 
    //         user_id,
    //         password_hash,
    //         password_salt,
    //         password_iter,
    //         email,
    //         expire_date
    //     )
    //     VALUES(?, ?, ?, ?, ?, ?, ?)
    //     ON DUPLICATE KEY UPDATE auth_code = ?`;
    //     const tokensConnection = await mysql.createConnection(tokensDbOptions);
    //     await tokensConnection.execute(query, [
    //         code, 
    //         req.body.user_id, 
    //         pswd.hash, 
    //         pswd.salt, 
    //         pswd.iterations, 
    //         req.body.email, 
    //         expireDate, 
    //         code
    //     ]);
    //     mail.type = "authJoin";
    //     mail.email = req.body.email;
    //     mail.user_id = req.body.user_id;
    //     mail.code = code;
    //     mail.makeForm();
    //     await mail.send();
    //     res.status(201).send(req.body.email);
    //     await tokensConnection.end();
    // } catch (error) {
    //     if(tokensConnection) await tokensConnection.end();
    //     res.sendStatus(500);
    // }
});

router.get('/join/result', (req, res) => {
    res.render('join_result');
});

router.get('/join/auth', async (req, res) => {
    try {
        const tokensConnection = await mysql.createConnection(tokensDbOptions);
        const [results] = await tokensConnection.execute(`SELECT * FROM auth_join WHERE auth_code = "${req.query.code}"`);

        if(results.length == 1) {
            const usersConnection = await mysql.createConnection(todoDbOptions);
            await usersConnection.execute(
                `INSERT IGNORE INTO users(
                    id, 
                    user_id, 
                    password_hash, 
                    password_salt, 
                    password_iter, 
                    email
                )
                VALUES(unhex(replace(uuid(),"-","")), ?, ?, ?, ?, ?)`,
                [
                    results[0].user_id, 
                    results[0].password_hash,
                    results[0].password_salt, 
                    results[0].password_iter, 
                    results[0].email
                ]);
            await tokensConnection.end();
            await usersConnection.end();
            res.redirect('/join/welcome');
        } else {
            if (tokensConnection) await tokensConnection.end();
            res.status(200).send('error');
        }
    } catch (error) {
        if (tokensConnection) await tokensConnection.end();
        if (usersConnection) await usersConnection.end();
        res.sendStatus(500);
    }
});

router.get('/join/error', (req, res) => {
    res.render('welcome', { "pageTitle": process.env.PAGE_TITLE } );
});

router.get('/join/welcome', (req, res) => {
    res.render('users/welcome', { "pageTitle": process.env.PAGE_TITLE } );
});

router.get('/profile', async (req, res) => {
    try {
        UserController.getEmailByUser(req, res);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post('/profile/img', uploadFileMiddleware.single('uploaded_file'), async (req, res) => {
    try {
        UserController.uploadUserImage(req, res);
        const usersConnection = await mysql.createConnection(todoDbOptions);
        const [field] = await usersConnection.execute(`SELECT user_img FROM users WHERE user_id="${req.session.user_id}"`);
        if(field) {
            const imgPath = PROFILE_IMG_PATH + "/" + field[0].user_img;

            fs.stat(imgPath, (err, stats) => {
                if (!err) {
                    fs.unlink(imgPath, (err) => {
                        if(err) throw err;
                    });
                }
            });
        }

        await usersConnection.execute(`UPDATE users SET user_img="${req.file.filename}" WHERE user_id="${req.session.user_id}"`);
        await usersConnection.end();
        req.session.userimg = req.file.filename;
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.delete('/profile/img', async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(todoDbOptions);
        const [field] = await usersConnection.execute(`SELECT user_img FROM users WHERE user_id="${req.session.user_id}"`);
        if(field) {
            const imgPath = PROFILE_IMG_PATH + "/" + field[0].user_img;

            fs.stat(imgPath, (err, stats) => {
                if (!err) {
                    fs.unlink(imgPath, (err) => {
                        if(err) throw err;
                    });
                }
            });
        }

        await usersConnection.execute(`UPDATE users SET user_img= NULL WHERE user_id="${req.session.user_id}"`);
        await usersConnection.end();
        req.session.userimg = "";
        res.sendStatus(204);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.put('/profile/edit/username', async (req, res) => {
    try {
        console.log(req.body.username);
        if (usernameFormat.test(req.body.username) == true) {
            const usersConnection = await mysql.createConnection(todoDbOptions);
            await usersConnection.execute(`UPDATE users SET username = "${req.body.username}" WHERE user_id = "${req.session.user_id}"`);
        } else {
            throw 'INVALIED_USERNAME'
        }
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get('/profile/edit/password', (req, res) => {
    try {
         res.render('users/edit_pswd', {
            "pageTitle": process.env.PAGE_TITLE
         });
    } catch (error) {
        res.sendStatus(500);
    }
});

router.get('/profile/edit/email', (req, res) => {
    try {
         res.render('users/edit_email', {
            "pageTitle": process.env.PAGE_TITLE
         });
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post('/profile/edit/send_code', async (req, res) => {
    try {
        const email = req.body.email;
        if(!emailFormat.test(email)) throw 'invalid format';
        const randomCode =  Math.floor(10000 + Math.random() * 90900);
        req.session.authNewEmail = {"email": email, "code": randomCode};

        mail.type = "authEdit";
        mail.email = email;
        mail.user_id = req.session.user_id;
        mail.code = randomCode;
        mail.makeForm();
        await mail.send();

        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

router.post('/profile/edit/auth_code', (req, res) => {
    try {
        if(req.session.authNewEmail) {
            if(req.session.authNewEmail.email == req.body.email && req.session.authNewEmail.code == parseInt(req.body.code)) {
                res.sendStatus(200);
            } else {
                throw 'not match code'
            }
        } else {
            throw 'code is expired'
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

router.put('/profile/edit/email/change', async (req, res) => {
    try {
        if(req.session.authNewEmail.email == req.body.newEmail && req.session.authNewEmail.code == req.body.code) {
            const usersConnection = await mysql.createConnection(todoDbOptions);
            const [results] = await usersConnection.execute(`SELECT id FROM users WHERE email = "${req.body.currentEmail}" AND user_id = "${req.session.user_id}"`)
            if(results) {
                await usersConnection.execute(`UPDATE users SET email = "${req.session.authNewEmail.email}" WHERE user_id = "${req.session.user_id}"`);
                await usersConnection.end();
                req.session.authNewEmail = "";
                res.sendStatus(200);
            } else {
                throw 'abnormal access'
            }
        } else {
            throw 'not match code'
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

router.put('/profile/edit/pswd/change', async (req, res) => {
    try {
            const usersConnection = await mysql.createConnection(todoDbOptions);
            const [results] = await usersConnection.execute(`SELECT password_hash, password_salt, password_iter FROM users WHERE user_id = "${req.session.user_id}"`)
            
            if(results) {
                const keylen = 128;
                const digest = 'sha512';
                const pswd = req.body.currentPswd;
                const hash = results[0].password_hash;
                const salt = results[0].password_salt.toString();
                const iterations = results[0].password_iter;
                const newPswd = req.body.newPswd;
                crypto.pbkdf2(pswd, salt, iterations, keylen, digest, async (err, derivedKey) => {
                    if(err) throw err;
                    if(derivedKey.equals(hash)) {
                            if(err) throw err;
                            const pswd = await hashPassword(newPswd);
                            await usersConnection.execute('UPDATE users SET password_hash=?, password_salt=?, password_iter=? WHERE user_id=?', [pswd.hash, pswd.salt, pswd.iterations, req.session.user_id])
                            await usersConnection.end();
                            res.sendStatus(200);
                    } else {
                        await usersConnection.end();
                        res.sendStatus(404);
                    }
                });
            }
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;