require('dotenv').config();
const { User } = require('../models/userModel');
const authService = require('../services/authService');
const cryptoUtility = require('../utilities/cryptoUtility');
const { reject } = require('lodash');
const { resolve } = require('node:path');

module.exports = {

    getAllUsers: (callback) => {
        db.query('SELECT * FROM users', function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    },

    resetUserPassword: async (username, email) => {
        const user = await User.findOne({
            where: {
                username: username,
                email: email
            }
        })
        if(user.length == 1) {
            const code = cryptoUtility.createRandomCode();
            let expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 1);

            // storing auth token which is better db and memeory  
            const tokensConnection = await mysql.createConnection(tokensDbOptions);
            let query = 'INSERT INTO reset_password (reset_code, user_id, expire_date) values(?, ?, ?) ON DUPLICATE KEY UPDATE reset_code=?';
            await tokensConnection.execute(query, [code, user[0].user_id, expireDate, code]);
            
            emailUtility.sendEmailToRestPassword(email, code);

            return new Promise(resolve(user.email));
        } else {
            return new Promise(reject('Not found user'));
        }
    },

    getUserbyUsernameAndPassword: async (userId, password, callback) => {
        const user = await User.findOne({
            attributes: ['id', 'nickname', 'image', 'salt'],
            where: {
                username: userId
            }
        });

        const unhashPswd = await cryptoUtility.unhashPassword(password, user.salt);

        if(unhashPswd = password) {
            const userDate = {
                id: user.id,
                nickname: user.nickname,
                image: user.image
            }
            callback(null, userDate);
        } else {
            const error = new Error('Error not fount user');
            callback(error, null);
        }
    },

    uploadUserImage: async (userId, filename, callback) => {
        await User.findOne({
            attributes: ['image'],
            where: {
                id: userId,
            }
        }).then(response => {
            if(response) {
                const imgPath = PROFILE_IMG_PATH + "/" + response[0].image;

                fs.stat(imgPath, (error, stats) => {
                    if (!error) {
                        fs.unlink(imgPath, (error) => { if(error) throw error; });
                    }
                });
            }
        }).then(response => {
            callback(null, response);
        }).catch(error => {
            callback(error, null);
        })

        


        // const [field] = await usersConnection.execute(`SELECT user_img FROM users WHERE user_id="${req.session.user_id}"`);
        // if(field) {
        //     const imgPath = PROFILE_IMG_PATH + "/" + field[0].user_img;

        //     fs.stat(imgPath, (err, stats) => {
        //         if (!err) {
        //             fs.unlink(imgPath, (err) => {
        //                 if(err) throw err;
        //             });
        //         }
        //     });
        // }

        await usersConnection.execute(`UPDATE users SET user_img="${req.file.filename}" WHERE user_id="${req.session.user_id}"`);
        await usersConnection.end();
        req.session.user.image = req.file.filename;
        res.sendStatus(200);
    },

    getUserByUserId: async (userId, callback) => {
        const user = await User.findOne({
            attributes: ['nickname', 'userId'],
            where: {
                userId: snsId,
            }
        });

        if(user == null) {
            callback(err, null);
        } else {
            callback(null, userId);
        }
    },

    getUserBySnsId: async (snsId, snsType, callback) => {
        try {
            const result = await User.findOne({
                attributes: ['id', 'nickname', 'snsId', 'snsType'],
                where: {
                    snsId: snsId,
                    snsType: snsType
                }
            });

            callback(result.dataValues);
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    getUserByEmail: (userEmail, callback) => {
        db.execute(`SELECT user_id FROM users WHERE email = "${userEmail}"`, function (err, row, result) {
            if (err) {
                callback(err, null);
            } else {
                let userId = new Array;
                row.forEach(element => {
                    element.user_id;
                    userId.push(element.user_id);
                });
                callback(null, userId);
            };
        })
    },

    createUser: async (userData, callback) => {
        const hashPassword = await cryptoUtility.hashPassword(userData.password);

        await User.create({
            username: userData.username,
            email: userData.email,
            socialType: socialType,
            password_hash: hashPassword.hash,
            password_salt: hashPassword.salt,
        }).then(respone => {
            callback(null, respone);
        })
        db.execute(`INSERT INTO auth_join (
            user_id,
            name,
            email,
            social_type,
            password_hash,
            password_salt,
            password_iter
        )
        VALUES(?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE auth_code = ?`,
        [userData.userId, userData.name, userData.email, userData.socialType, userData.hash, userData.salt], function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result.row[0]);
            }
        });
    },

    updateUserById: (userId, userData, callback) => {
        db.query('UPDATE user SET name=username, email=, password=, img, FROM users WHERE user_id = userId', function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result.row[0]);
            }
        });
    },

    deleteUserById: (userId, callback) => {
        db.query(`DELETE FROM users WHERE id=${userId}`, function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    },
    
    hashPassword: async (password, callback) => {
        try {
            cryptoUtility.hashPassword()
            const salt = crypto.randomBytes(128).toString("base64");
            const iterations = 10000;
            const keylen = 128;
            const digest = 'sha512';
            crypto.pbkdf2(password, salt, iterations, keylen, digest, (err, derivedKey) => {
                if(err) {
                    throw err;
                } else {
                    callback(null, {salt: salt, hash:derivedKey});
                }
            });
        } catch (err) {
            callback(err, null);
        }
    },

    getUserFromSns: async (code, state, snsType) => {
        try {
            let user = {};
            if(snsType == 'naver') {
                const token = await authService.getTokenFromNaver(code, state);
                user = await authService.getUserFromNaverToken(token);
            } else {
                const token = await authService.getTokenFromKakao(code, state);
                user = await authService.getUserFromKakaoToken(token);
            }
            console.log(user);
            return user
        } catch (err) {
            console.error(err);
        }
    },

    deleteSnsUser: async (req, res, callback) => {
        const token = await authService.getTokenFromKakao(code, state);
        const snsId = await authService.deleteKakaoUserByToken(token);
        if(snsId) {
            User.destroy({
                where: {
                    snsId: snsId,
                    snsType: 'kakao'
                }
            }).then(() => {
                callback(null);
            }).catch(error => {
                console.error(error);
                callback(error)
            })
        }
    },

    isUserExistInDb: async (user) => {
        const snsId = user.snsId;
        try {
            if(snsId) {
                const userCount = await User.count({
                    where: { snsId: snsId }
                });
    
                if(userCount > 0) {
                    return true
                } else {
                    return false
                }
            }
        } catch (err) {
            console.error(err);
        }
    },

    createSnsUser: async (userData) => {
        try {
            const nickname = userData.nickname ? userData.nickname : "익명" ;
            const snsId = userData.snsId;
            const email = userData.email;
            const snsType = userData.snsType;
    
            const result = await User.create({
                nickname: nickname,
                email: email,
                snsId: snsId,
                snsType: snsType,
                snsConnectAt: new Date()
            });

            return result;
        } catch (err) {
            console.error(err);
        }
    },

    getEmailByUser: async (userId, callback) => {
        try {
            let result = await User.findOne({
                attributes: ['email', 'snsType'],
                where: { id: userId }
            });
            const regEx = /(?<=.{2})[^@\n](?=[^@\n]*?@)|(?<=\w{2})[^@\n](?=[^@\n]*?[.])/g
            result.email = result.email.replace(regEx, '*');

            if(result) callback(null, result);
        } catch (error) {
            console.log(error);
            callback(error, null);
        }

    }
}