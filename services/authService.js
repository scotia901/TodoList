require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cryptoUtility = require('../utilities/cryptoUtility');
const emailUtility = require('../utilities/emailUtility');
const AuthModel = require('../models/authModel');
const { User } = require('../models/todoModel');
const naverId = process.env.NAVER_CLIENT_ID;
const kakaoKey = process.env.KAKAO_REST_KEY;
const naverSecret = process.env.NAVER_CLIENT_SECRET;

module.exports = {
    getTokenFromKakao: async (code, state, callbackUri) => {
        const params = new URLSearchParams();
        const api_url = 'https://kauth.kakao.com/oauth/token';
        params.append('grant_type', "authorization_code");
        params.append('client_id', kakaoKey);
        params.append('code', code);
        params.append('state', state);
        params.append('redirect_uri', callbackUri);

        const token = await fetch(api_url, {
            method: "POST",
            headers:{ "Content-type": "application/x-www-form-urlencoded"},
            body: params
        });

        if(token.error) {
            throw token.error
        } else {
            return token.json();
        }
    },

    getUserFromKakaoToken: async (token) => {
        const authorization = token.token_type + " " + token.access_token;

        const result = await fetch("https://kapi.kakao.com/v2/user/me", {
            method: "GET",
            headers: { 'Authorization': authorization }
        }).then(async response => {
            return await response.json();
        });

        if(result.msg && result.code) {
            throw result;
        } else {
            const user = {
                nickname: result.properties.nickname,
                email: result.kakao_account.email,
                snsId: result.id,
                snsType: 'kakao'
            };
            return user;
        }

    },

    deleteKakaoUserByToken: async (token) => {
        const authorization = token.token_type + " " + token.access_token;
        const result = await fetch("https://kapi.kakao.com/v1/user/unlink", {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': authorization
            }
        }).then((response) => response.json());
        if(result.error) {
            throw result.error
        } else {
            return result;
        }
    },

    getTokenFromNaver: async (code, state, callbackUrl) => {
        const api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
                        + naverId + '&client_secret=' + naverSecret + '&redirect_uri=' + callbackUrl + '&code=' + code + '&state=' + state;
        const result = await fetch(api_url).then((response) => response.json());

        if(result.error) {
            return result.error;
        } else {
            return result;
        }
    },

    getUserFromNaverToken: async (token) => {
        const authorization = token.token_type + " " + token.access_token;

        const result = await fetch('https://openapi.naver.com/v1/nid/me', {
            Accept: "*/*",
            headers: {
                'X-Naver-Client-Id':naverId,
                'X-Naver-Client-Secret': naverSecret,
                'Authorization': authorization
            }
        }).then((response) => response.json());

        if(result.resultcode == '00') {
            const user = {
                nickname: result.response.nickname,
                email: result.response.email,
                snsId: result.response.id,
                snsType: 'naver'
            };
            return user;
        } else {
            const error = {
                code: result.resultcode,
                message: result.message
            }
            throw error;
        }
    },

    deleteNaverUserByToken: async (token) => {
        const access_token = token.access_token;
        const api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=delete&service_provider=NAVER&client_id=' + naverId + '&client_secret=' + naverSecret + '&access_token=' + access_token;
        const result = await fetch(api_url);

        if(result.error) {
            throw result.error;
        } else {
            return result.json();
        }
    },

    refreshNaverToken: async (refreshToken) => {
        const api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=refresh_token&client_id=' + naverId + '&client_secret='
        + naverSecret + '&refresh_token=' + refreshToken;
        
        const response = await fetch(api_url).then((response) => response);
        return response;
    },

    saveUserToSession: async (req, userId, callback) => {
        req.session.regnerate((err) => {
            req.session.userId = userId;
            req.session.nickname = nickname;
            req.session.userImage = userImage;

            if(err) {
                callback(err);
            } else {
                req.session.save(async (err) => {
                    callback(err);
                });
            }
        });
    },

    createJoinAuth: async (userData) => {
        const hashPassword = await cryptoUtility.generateHashAndSalt(userData.password);
        const token = await cryptoUtility.createRandomHash(128, 'base64');
        const expireDate = new Date();
        expireDate.setMinutes(new Date().getMinutes() + 30);

        return new Promise(async (resolve, reject) => {
            await AuthModel.storeJoinData({
                username: userData.username,
                nickname: userData.nickname,
                passwordHash: hashPassword.hash,
                passwordSalt: hashPassword.salt,
                email: userData.email,
                token: token,
                expire: expireDate
            }, (error) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(token);
                }
            });
        })

    },

    createResetPasswordAuth: async (username) => {
        const token = await cryptoUtility.createRandomHash(128, 'base64');
        const expireDate = new Date();
        expireDate.setMinutes(new Date().getMinutes() + 30);

        return new Promise((resolve, reject) => {
            AuthModel.storeResetPasswordData({
                username: username,
                token: token,
                expire: expireDate
            }, (error) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(token);
                }
            });
        });
    },

    createUpdateEmailAuth: async (email) => {
        const code = await cryptoUtility.createRandomDigit(5);
        const expireDate = new Date();
        expireDate.setMinutes(new Date().getMinutes() + 30);
        
        await AuthModel.storeUpdateEmailData({
            email: email,
            code: code,
            expire: expireDate
            });
        return code;
    },

    getResetPswdUserByToken: async (token) => {
        const user = await AuthModel.getResetPswdUserByToken(token);
        return user;
    },
    
    sendResetPasswordEmail: async (username, email, token) => {
        await emailUtility.sendResetPasswordMail(username, email, token);
    },

    sendJoinUserEmail: async (username, email, token) => {
        await emailUtility.sendJoinUserEmail(username, email, token);
    },

    authResetPassword: async (token) => {
        const hasToken =  await AuthModel.checkHasToken(token);
        return hasToken;
    },

    getJoinUserByToken: async (token) => {
        const user = await AuthModel.getJoinUserByToken(token);
        if(user) { return user; }
        else { return null; }
    },

    sendAuthCode: async (email, code) => {
        await emailUtility.sendUpdateUserMail(email, code);
    },

    authUpdateEmail: async (email, code) => {
        const isAuth = await AuthModel.checkEmailAndCode(email, code);
        return isAuth;
    },

    verifyPswdByUserId: async (userId, password) => {
        const dbPassword = await User.findOne({
                    attributes: ['passwordHash', 'passwordSalt'],
                    where: { id: userId }
                });
        const dbPasswordHash = dbPassword.passwordHash;
        const reqPasswordHash = await cryptoUtility.createHashByPasswordAndSalt(password, dbPassword.passwordSalt);

        if(reqPasswordHash.toString('hex') == dbPasswordHash.toString('hex')) {
            return true;
        } else {
            return false;
        }
    }
}