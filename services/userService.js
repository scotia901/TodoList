require('dotenv').config();
const { User } = require('../models/todoModel');
const authService = require('../services/authService');
const TaskService = require('../services/taskService');
const CategoryService = require('../services/categoryService');
const cryptoUtility = require('../utilities/cryptoUtility');
const fileUtility = require('../utilities/fileUtility');

module.exports = {
    checkUserbyUsername: async (username) => {
        const userCount = await User.count({ where: { name: username } });
        return userCount == 1 ? true : false;
    },

    checkUserbyNickname: async (nickname) => {
        const userCount = await User.count({ where: { nickname: nickname } });
        return userCount == 1 ? true : false;
    },

    getUserbyUsernameAndPassword: async (username, password) => {
        const user = await User.findOne({
            attributes: ['id', 'nickname', 'profileImg', 'passwordHash', 'passwordSalt'],
            where: {
                name: username
            }
        });

        if(!user) {
            return 'Not found user';
        } else {
            const passwordHash = await cryptoUtility.createHashByPasswordAndSalt(password, user.passwordSalt);

            if(user.passwordHash.toString() === passwordHash.toString()) {
                const userData = {
                    id: user.id,
                    nickname: user.nickname,
                    profileImg: user.profileImg
                }
                return userData;
            } else {
                return 'Not match password';
            }
        }
    },

    updateUserImage: async (userId, filename) => {
        const user = await User.findOne({
            attributes: ['profileImg'],
            where: {
                id: userId,
            }
        });

        if(user.profileImg != null) {
            const imgPath = process.env.PROFILE_IMG_PATH + "/" + user.profileImg;
            fileUtility.deleteFile(imgPath, (error) => { throw error; });
        }

        const result = await User.update({ profileImg: filename }, { where: { id: userId }});
        if(result[0] == 1) {
            return filename;
        } else {
            throw 'Bad request';
        }
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
            const result = await User.findOne({
                attributes: ['id', 'nickname', 'snsId', 'snsType', 'profileImg'],
                where: {
                    snsId: snsId,
                    snsType: snsType
                }
            });

            if(result) {
                return result.dataValues;
            } else {
                throw 'Not found';
            }
    },

    getUsersByEmail: async (userEmail) => {
        const users = await User.findAll({
            attributes: ['name'],
            where: {
                email: userEmail,
                snsId: null,
            }
        });

        if(users.length > 0) {
            return users;
        }  else {
            return null;
        }
    },

    getUsersByEmailAndUserName: async (userName, userEmail, callback) => {
        User.count({
            where: {
                email: userEmail,
                name: userName,
                snsId: null,
            }
        }).then(response => {
            callback(null, response);
        }).catch(error => {
            error.statsu = 500;
            callback(error, null);
        })
    },

    createUser: async (user) => {
        const result = await User.create({
            name: user.username,
            nickname: user.nickname,
            email: user.email,
            passwordHash: user.passwordHash,
            passwordSalt: user.passwordSalt,
        });

        await CategoryService.createDefaultCategoriesByUser(result.id);
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

    deleteUserById: async (userId) => {
        const result = await User.destroy({ where: { id: userId }});
        if(result != 1) throw 'Bad request';
    },

    getUserFromSns: async (code, state, snsType) => {
        let data = {token: new Object(), user: new Object()};
        if(snsType == 'naver') {
            const callbackUrl = process.env.AUTH_CALLBACK_URI + 'login/naver';
            data.token = await authService.getTokenFromNaver(code, state, callbackUrl);
            data.user = await authService.getUserFromNaverToken(data.token);
        } else if(snsType == 'kakao') {
            const callbackUrl = process.env.AUTH_CALLBACK_URI + 'login/kakao';
            data.token = await authService.getTokenFromKakao(code, state, callbackUrl);
            data.user = await authService.getUserFromKakaoToken(data.token);
        } else {
            throw 'Bad Request';
        }

        return data;
    },

    deleteSnsUser: async (userId, snsType, code, state) => {
        let snsUser = {};
        if(snsType == 'naver') {
            const callbackUrl = process.env.AUTH_CALLBACK_URI + 'delete/naver'
            const token = await authService.getTokenFromNaver(code, state, callbackUrl);
            snsUser = await authService.deleteNaverUserByToken(token);
        } else if(snsType == 'kakao') {
            const callbackUrl = process.env.AUTH_CALLBACK_URI + 'delete/kakao'
            const token = await authService.getTokenFromKakao(code, state, callbackUrl);
            snsUser = await authService.deleteKakaoUserByToken(token);
        } else {
            throw 'Bad request';
        }

        if(snsUser.id || snsUser.result == 'success') {
            await TaskService.deleteTasksbyUser(userId);
            await CategoryService.deleteCategoriesByUser(userId);
            await User.destroy({
                where: {
                    id: userId,
                    snsType: snsType
                }
            });
        } else {
            throw 'Not found';
        }
    },

    isUserExistInDb: async (userData) => {
        const snsId = userData.snsId;
        const userCount = await User.count({ where: { snsId: snsId }});

        if(userCount > 0) {
            return true;
        } else {
            return false; 
        }
    },

    createSnsUser: async (userData) => {
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

            await CategoryService.createDefaultCategoriesByUser(result.id);
            return result;
    },

    getUserProfileByUserId: async (userId) => {
            const result = await User.findOne({
                attributes: ['email', 'snsType', 'name', 'nickname', 'profileImg'],
                where: { id: userId }
            });
            const regEx = /(?<=.{2})[^@\n](?=[^@\n]*?@)|(?<=\w{2})[^@\n](?=[^@\n]*?[.])/g
            result.email = result.email.replace(regEx, '*');

            if(result) {
                return result;
            } else {
                return null;
            }
    },

    updateNicknameByUserId: async (userId, nickname) => {
        const result = await User.update({ nickname: nickname }, { where: { id: userId }});
        if(result[0] != 1) throw 'Not found';
    },

    updateEmailByUserId: async (userId, email) => {
        const result = await User.update({ email: email }, { where: { id: userId }});
        if(result[0] != 1) throw 'Not found';
    },

    updatePasswordByUserId: async (userId, password) => {
        const hashPassword = await cryptoUtility.generateHashAndSalt(password);
        const result = await User.update({
            passwordHash: hashPassword.hash,
            passwordSalt: hashPassword.salt
        }, {
            where: {
                id: userId
            }
        });

        if(result[0] != 1) throw 'Not found';
    },

    updatePasswordByUsername: async (username, password) => {
        const hashPassword = await cryptoUtility.generateHashAndSalt(password);
        const result = await User.update({
            passwordHash: hashPassword.hash,
            passwordSalt: hashPassword.salt
        }, {
            where: { name: username }
        });

        if(result[0] != 1) throw 'Not found';
    }
}