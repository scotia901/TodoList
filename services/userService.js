require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const db = require('../db');
const { User } = require('../models/userModel');
const crypto = require('node:crypto');
const authService = require('../services/authService');
const Sequelize = require('sequelize/lib/sequelize');

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

            console.log(userData);
            const nickname = userData.nickname? userData.nickname : "익명" ;
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
    }
}