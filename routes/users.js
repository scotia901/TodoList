const UPLOAD_IMG_PATH = "public/data/uploads/img"
require('dotenv').config();
const crypto = require('node:crypto');
const fs = require('fs');
const mysql = require('mysql2/promise');
const express = require('express');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_IMG_PATH);
    },
    filename: (req, file, cb) => {
        const uniqueName = Math.round(Math.random() * 1E15);
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext)
    }
});
const upload = multer({ storage: storage });
const nodemailer = require('nodemailer');
const idFormat = /^[\w-]{5,20}$/;
const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;
const usersDbOptions = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_USERS_DATABASE
}
const tokenssDbOptions = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_TOKEN_DATABASE
}
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

async function sendmail(type, toEmail, username, code) {
    try {
        const transport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            },
        });
        let subjectText, bodyText;
    
        if(type == "resetPswd") {
            subjectText = "ToDo 비밀번호 변경 메일";
            bodyText = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${username} 님이 비밀번호 초기화를 요청하였습니다.</div><br>
            비밀번호 변경을 원하시면 아래의 버튼 클릭하시고 비밀번호를 변경하여 주세요.<br><br>
            <a href="${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/users/find_pswd/reset?&code=${encodeURIComponent(code)}">
            비밀번호 변경하기</a>`;
        } else if(type == "authJoin") {
            subjectText = "Todo 가입 인증 메일"
            bodyText = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${username} 님이 가입을 요청 하셨습니다.</div><br>
            아래의 버튼을 누르시면 가입이 완료됩니다.<br><br>
            <a href="${process.env.SERVER_HOST}:${process.env.SERVER_PORT}/users/join/auth?&code=${encodeURIComponent(code)}">
            가입 완료하기</a>`;
        } else if(type = "authEdit") {
            subjectText = "Todo 회원 정보 변경 메일"
            bodyText = `<div>${process.env.SERVER_HOST}:${process.env.SERVER_PORT} 에서 ${username} 님이 회원 정보 변견을 요청 하셨습니다.</div><br>
            아래의 5자리 숫자를 인증코드 창에 넣으셔서 인증을 완료해주세요..<br><br>
            <a>${code}</a>`;
        } else {
            throw 'Unknown mail type';
        }
        
        await transport.sendMail({
            from: process.env.ADMIN_EMAIL,
            to: toEmail,
            subject: subjectText,
            html: bodyText
        });
        transport.close();
    } catch (error) {
        console.log(error);
    }
}

router.post('/login', async (req, res) => {
    try {
        if (!idFormat.test(req.body.username) || !pswdFormat.test(req.body.password)) throw 'invalid format'
        
        const usersConnection = await mysql.createConnection(usersDbOptions);
        const [results] = await usersConnection.execute(`SELECT username, user_img, password_hash, password_salt, password_iter FROM users WHERE username = "${req.body.username}"`);
        if(results.length > 0) {
            const keylen = 128;
            const digest = 'sha512';
            const pswd = req.body.password;
            const hash = results[0].password_hash;
            const salt = results[0].password_salt.toString();
            const iterations = results[0].password_iter;
            const keepLoginAge = 1000000;

            crypto.pbkdf2(pswd, salt, iterations, keylen, digest, async (err, derivedKey) => {
                if(err) throw err;
                if(derivedKey.equals(hash)) {
                    req.session.regenerate( (err) => {
                        if(err) throw err;
                        if(req.body.keepLogin == "true") {
                            // req.session.cookie.maxAge = keepLoginAge;
                            // req.session.cookie.expries = new Date(Date.now() + keepLoginAge);
                        }
                        req.session.isLogined = true;
                        req.session.username = results[0].username;
                        req.session.userimg = results[0].user_img;
                        if(!req.session.currentCategory) req.session.currentCategory = "오늘 할 일";
                        req.session.save(async (err) => {
                            if (err) throw err;
                            await usersConnection.end();
                            res.sendStatus(200);
                        });
                    });
                } else {
                    await usersConnection.end();
                    res.sendStatus(404);
                }
            });
        } else {
            await usersConnection.end();
            res.sendStatus(404);
        }
    } catch (error) {
        await usersConnection.end();
        res.statusCode(400);
    }
});

router.delete('/logout', (req, res) => {
    try {
        req.session.destroy( (err) => {
            if(err) throw err;
            res.sendStatus(200);
        })
    } catch (error) {
        res.sendStatus(400);
    }
});

router.use((req, res, next) => {
    if(req.session.isLogined == true) {
        next();
    } else {
        res.redirect('/');
    }
});

router.get('/find_id', (req, res) => {
    res.render('users/find_id', { "pageTitle": process.env.PAGE_TITLE });
});

router.post('/find_id/send', async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(usersDbOptions);
        const [results] =  await usersConnection.execute(`SELECT username FROM users WHERE email = "${req.body.email}"`);
        if(results.length > 0) {
            let users = "";
            const usersKey = "users[]=";
            for await (let user of results) {
                users +=  "&" + usersKey + user.username;
            }
            await usersConnection.end();
            res.status(201).send(users);
        } else {
            await usersConnection.end();
            res.status(201).send("NotFoundUser");
        }
    } catch (error) {
        await usersConnection.end();
        res.sendStatus(400);
    }
});

router.get('/find_id/results', (req, res) => {
    if(req.query.users == undefined) {
        res.send('render not joined page');
    } else {
        res.render('find_result', {
            "pageTitle": process.env.PAGE_TITLE,
            "users": req.query.users,
            "findType": "id"
        });
    }
});

router.get('/find_pswd', (req, res) => {
    res.render('find_pswd', { "pageTitle": process.env.PAGE_TITLE });
});

router.post('/find_pswd/send', async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(usersDbOptions);
        let query = `SELECT username, email FROM users WHERE username = "${req.body.id}" AND email = "${req.body.email}"`;
        const [user] = await usersConnection.execute(query);
        if(user.length == 1) {
            const code = crypto.randomBytes(64).toString("base64");
            let expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 1);

            const tokensConnection = await mysql.createConnection(tokensDbOptions);
            let query = 'INSERT INTO reset_password (reset_code, username, expire_date) values(?,?,?) ON DUPLICATE KEY UPDATE reset_code=?';
            await tokensConnection.execute(query, [code, results[0].username, expireDate, code]);

            await sendmail("resetPswd",results[0].email, results[0].username, code);
            await usersConnection.end();
            await tokensConnection.end();
            res.status(200).send(results[0].email);
        } else {
            await usersConnection.end();
            await tokensConnection.end();
            res.sendStatus(200).send('NotFoundUser');
        }    
    } catch (error) {
        await usersConnection.end();
        await tokensConnection.end();
        res.sendStatus(400);
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

router.post('/reset_pswd/reset', async (req, res) => {
    try {
        if(pswdFormat.test(req.body.password)) {
            const tokensConnection = await mysql.createConnection(tokenssDbOptions);
            const [results] = await tokensConnection.execute(`SELECT username FROM reset_password WHERE reset_code = "${req.body.code}"`);
            if(results.length == 1) {
                    const pswd = await hashPassword(req.body.password);
                    const usersConnection = await mysql.createConnection(usersDbOptions);
                    await usersConnection.execute('UPDATE users SET password_hash=?, password_salt=?, password_iter=? WHERE username=?', [pswd.hash, pswd.salt, pswd.iterations, results[0].username]);
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

router.get('/reset_pswd/reset', async (req, res) => {
    const tokensConnection = await mysql.createConnection(tokenssDbOptions);
    const [results] = await tokensConnection.execute(`SELECT username FROM reset_password WHERE reset_code = "${req.query.code}"`);
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

router.get('/join/verify/:username', async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(usersDbOptions);
        const [rows] = await usersConnection.execute(`SELECT username FROM users WHERE username = "${req.params.username}"`);
        if(rows.length > 0) {
            await usersConnection.end();
            res.status(200).send('existingUsername');
        } else {
            await usersConnection.end();
            res.status(200).send('notExistingUsername');
        }
    } catch (error) {
        await usersConnection.end();
        res.sendStatus(400);
    }
});

const verifyJoinForm = async (req, res, next) => {
    if (!idFormat.test(req.body.username) || !emailFormat.test(req.body.email) || !pswdFormat.test(req.body.password)) {
        res.status(400).send('유효하지 않는 데이터');
    } else {
        const usersConnection = await mysql.createConnection(usersDbOptions);
        const [rows] = await usersConnection.execute(`SELECT username FROM users WHERE email = "${req.body.email}"`);
        if(rows.length > 4) {
            await usersConnection.end();
            res.status(200).send('maxJoinedUsers');
        } else {
            const query = `SELECT username FROM users WHERE username = "${req.body.username}"`;
            const [rows] = await usersConnection.execute(query);
            if(rows.length > 0) {
                await usersConnection.end();
                res.status(200).send('existingUsername');
            } else {
                next();
            }
        }
    }
}

router.post('/join/submit', [verifyJoinForm], async (req, res) => {
    try {
        const pswd = await hashPassword(req.body.password);
        const code = crypto.randomBytes(64).toString("base64");
        let expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 1);
        const query = 'INSERT INTO auth_join (auth_code, username, password_hash, password_salt, password_iter, email, expire_date, auth_code) values(?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE auth_code=?';
        const tokensConnection = await mysql.createConnection(tokenssDbOptions);
        const [result] = await tokensConnection.execute(query, [code, req.body.username, pswd.hash, pswd.salt, pswd.iterations, req.body.email, expireDate,code]);
        // usersConnection.execute('INSERT IGNORE INTO users (id, username, password_hash, password_salt, password_iter, email) values (unhex(replace(uuid(),"-","")), ?, ?, ? ,?, ?)', [req.body.username, pswd.hash, pswd.salt, pswd.iterations, req.body.email], 
        await sendmail(req.body.email, req.body.username, code);
        res.status(200).send(req.body.email);
        await tokensConnection.end();
        res.sendStatus(201);
    } catch (error) {
        await tokensConnection.end();
        res.sendStatus(400);
    }
});

router.get('/join/result', (req, res) => {
    res.render('send_email')
});

router.get('/join/auth', async (req, res) => {
    try {
        const tokensConnection = await mysql.createConnection(tokenssDbOptions);
        await tokensConnection.execute(`SELECT username FROM auth_join WHERE auth_code = "${req.query.code}"`);
            if(results.length == 1) {
                await tokensConnection.execute('INSERT IGNORE INTO users (id, username, password_hash, password_salt, password_iter, email) values (unhex(replace(uuid(),"-","")), ?, ?, ? ,?, ?)', [req.body.username, pswd.hash, pswd.salt, pswd.iterations, req.body.email]);
                await tokensConnection.end();
                res.redirect('/join/welcome');
            } else {
                await tokensConnection.end();
                res.status(200).send('error');
            }
    } catch (error) {
        await tokensConnection.end();
        res.status(400).send();
    }
});

router.get('/join/error', (req, res) => {
    res.render('welcome', { "pageTitle": process.env.PAGE_TITLE } );
});

router.get('/join/welcome', (req, res) => {
    res.render('welcome', { "pageTitle": process.env.PAGE_TITLE } );
});

router.post('/sample', async (req, res) => {
    console.log("테스트")
    console.log(req.body);
    res.send(req.body);
});

router.get('/profile', async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(usersDbOptions);
        const [results] = await usersConnection.execute(`SELECT username, user_img, email FROM users WHERE username = "${req.session.username}"`);
        const username = results[0].username;
        const userImg = results[0].user_img;
        let [emailUser, emailDomain] = results[0].email.split("@");
        const [emailname, domain]= emailDomain.split(".");
        emailUser = emailUser.substring(0,2) + emailUser.substring(2,).replace(/./g, "*");
        emailDomain = emailname.substring(0,2) + emailname.substring(2,).replace(/./g, "*") + "." + domain;
        const hiddenEmail = emailUser + "@" + emailDomain;

        await usersConnection.end();
        res.render('users/profile', {
            "pageTitle": process.env.PAGE_TITLE,
            "username": username,
            "userimg": userImg,
            "email": hiddenEmail
        });
    } catch (error) {
        res.sendStatus(400);
    }
});

router.post('/profile', upload.single('uploaded_file'), async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(usersDbOptions);
        const [field] = await usersConnection.execute(`SELECT user_img FROM users WHERE username="${req.session.username}"`);
        console.log(field);
        if(field) {
            const imgPath = UPLOAD_IMG_PATH + "/" + field[0].user_img;

            fs.stat(imgPath, (err, stats) => {
                if (!err) {
                    fs.unlink(imgPath, (err) => {
                        if(err) throw err;
                    });
                }
            });
        }

        await usersConnection.execute(`UPDATE users SET user_img="${req.file.filename}" WHERE username="${req.session.username}"`);
        await usersConnection.end();
        req.session.userimg = req.file.filename;
        res.sendStatus(200);
    } catch (error) {
        res.status(400);
    }
});

router.delete('/profile/img', async (req, res) => {
    try {
        const usersConnection = await mysql.createConnection(usersDbOptions);
        const [field] = await usersConnection.execute(`SELECT user_img FROM users WHERE username="${req.session.username}"`);
        if(field) {
            const imgPath = UPLOAD_IMG_PATH + "/" + field[0].user_img;

            fs.stat(imgPath, (err, stats) => {
                if (!err) {
                    fs.unlink(imgPath, (err) => {
                        if(err) throw err;
                    });
                }
            });
        }

        await usersConnection.execute(`UPDATE users SET user_img= NULL WHERE username="${req.session.username}"`);
        await usersConnection.end();
        req.session.userimg = "";
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(400);
    }
});

router.get('/profile/edit/password', (req, res) => {
    try {
         res.render('users/edit_pswd', {
            "pageTitle": process.env.PAGE_TITLE
         });
    } catch (error) {
        res.sendStatus(400);
    }
});

router.get('/profile/edit/email', (req, res) => {
    try {
         res.render('users/edit_email', {
            "pageTitle": process.env.PAGE_TITLE
         });
    } catch (error) {
        res.sendStatus(400);
    }
});

router.post('/profile/edit/send_code', async (req, res) => {
    try {
        const email = req.body.email;
        if(!emailFormat.test(email)) throw 'invalid format';
        const randomCode =  Math.floor(10000 + Math.random() * 90900);
        req.session.authNewEmail = {"email": email, "code": randomCode};
        await sendmail("authEdit", email, req.session.username, randomCode);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(400);
    }
});

router.post('/profile/edit/auth_code', (req, res) => {
    try {
        if(req.session.authNewEmail.email == req.body.email && req.session.authNewEmail.code == parseInt(req.body.code)) {
            res.sendStatus(200);
        } else {
            throw 'sessions is expired'
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.put('/profile/edit/email/change', async (req, res) => {
    try {
        if(req.session.authNewEmail.email == req.body.newEmail && req.session.authNewEmail.code == req.body.code) {
            const usersConnection = await mysql.createConnection(usersDbOptions);
            const [results] = await usersConnection.execute(`SELECT id FROM users WHERE email = "${req.body.currentEmail}" AND username = "${req.session.username}"`)
            if(results) {
                await usersConnection.execute(`UPDATE users SET email = "${req.session.authNewEmail.email}" WHERE username = "${req.session.username}"`);
                await usersConnection.end();
                req.session.authNewEmail = "";
                res.sendStatus(200);
            } else {
                throw 'not match code'
            }
        } else {
            throw 'incorrect new email or auth code'
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});

router.put('/profile/edit/pswd/change', async (req, res) => {
    try {
            const usersConnection = await mysql.createConnection(usersDbOptions);
            const [results] = await usersConnection.execute(`SELECT password_hash, password_salt, password_iter FROM users WHERE username = "${req.session.username}"`)
            
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
                            console.log(pswd.hash);
                            await usersConnection.execute('UPDATE users SET password_hash=?, password_salt=?, password_iter=? WHERE username=?', [pswd.hash, pswd.salt, pswd.iterations, req.session.username])
                            await usersConnection.end();
                            res.sendStatus(200);
                    } else {
                        await usersConnection.end();
                        res.sendStatus(404);
                    }
                });
            }
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
});



module.exports = router;