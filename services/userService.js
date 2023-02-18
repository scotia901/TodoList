require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const db = require('../db');
const userModel = require('../models/userModel');
const crypto = require('node:crypto');
const authService = require('../services/authService');

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

    getUserById: (userId, callback) => {
        db.query(`SELECT * FROM users WHERE user_id = "${userId}"`, function(err, result) {
            if(err) {
                callback(err, null);
            } else {
                callback(null, result.row[0]);
            }
        });
    },

    getUserByEmail: function (userEmail, callback)  {
        db.execute(`SELECT user_id FROM users WHERE email = "${userEmail}"`, function (err, row, result) {
            if (err) {
                callback(err, null);
            } else {
                let userId = new Array;
                row.forEach(element => {
                    element.user_id
                    userId.push(element.user_id);
                });
                callback(null, userId);
            };
        })

    },

    createUser: async (userData, callback) => {
        const userService = require('../services/userService')
        await userService.hashPassword(userData.password, (err, password) => {
            if(err) {
                console.log(err);
                callback(err, null);
            } else {
                console.log(password);
                callback(err, password);
            }
        });

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

    createUserByKaKao: async (resoruce, callback) => {
        try {
            const id = resoruce.id;
            const email = resoruce.email;
            const type = 'kakao'
    
            await userModel.create({
                name: id,
                email: email
            });
        } catch (err) {
            callback(err);
        }
    },

    createUserByNaver: async (resoruce, callback) => {
        try {
            const id = resoruce.id;
            const email = resoruce.email;
            const type = 'naver'
    
            await userModel.create({
                name: id,
                email: email,
                type: type
            });
        } catch (err) {
            callback(err);
        }
    },

    getUserFromNaver: async (code, state, callback) => {
        try {
            const token = await authService.getTokenFromNaver(code, state);
            const user = await authService.getUserFromNaverToken(token);
            if(user) { callback(null, user); }
        } catch (err) {
            callback(err, null);
        }
    },

    getUserFromKakao: async (code, state, callback) => {
        try {
            const token = await authService.getTokenFromKakao(code, state);
            const user = await authService.getUserFromKakaoToken(token);
            if(user) { callback(null, user); }
        } catch (err) {
            console.log(err);
            callback(err, null);
        }
    },
}