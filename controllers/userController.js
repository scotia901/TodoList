require('dotenv').config();
const userService = require('../services/userService');
const authService = require('../services/authService');
const cryptoUtility = require('../utilities/cryptoUtility');

module.exports = {
    renderLoginPage: async (req, res, next) => {
        try {
            const kakaoKey = process.env.KAKAO_REST_KEY;
            const naverClientId = process.env.NAVER_CLIENT_ID;
            const recaptchaClient = process.env.RECAPTCHA_CLIENT;
            const callbackUrl = encodeURIComponent(process.env.AUTH_CALLBACK_URI);
            const token = req.session.auth.CSRFToken;
            const naverApi_url = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" +
                naverClientId + '&redirect_uri=' + callbackUrl + "login/naver" + '&state=' + token;
            const kakaoApi_url = "https://kauth.kakao.com/oauth/authorize?&response_type=code&client_id=" +
                kakaoKey + '&redirect_uri=' + callbackUrl + "login/kakao" + '&state=' + token;

            req.session.auth = { CSRFToken: token };
            res.render('users/login', {
                "pageTitle": process.env.PAGE_TITLE,
                "naverApi_url": naverApi_url,
                "kakaoApi_url": kakaoApi_url,
                "recaptchaClientKey": recaptchaClient,
            });
        } catch (error) {
            next(error);
        }
    },

    renderResetPasswordPage: (req, res, next) => {
        try {
            res.render('reset_pswd');
        } catch (error) {
            next(error);
        }
    },

    renderFindPasswordPage: (req, res) => {
        res.render('users/find_pswd', {
            "pageTitle": process.env.PAGE_TITLE
        });
    },

    renderUpdatePasswordPage: (req, res) => {
        res.render('users/edit_pswd', {
            "pageTitle": process.env.PAGE_TITLE
        });
    },

    renderUpdateEmailPage: (req, res) => {
        res.render('users/edit_email', {
            "pageTitle": process.env.PAGE_TITLE
        });
    },

    renderJoinPage: (req, res) => {
        res.render('users/join', {
            "pageTitle": process.env.PAGE_TITLE
        });
    },

    renderFindIdPage: (req, res) => {
        res.render('users/find_id', {
            "pageTitle": process.env.PAGE_TITLE
        });
    },

    getUserByUsernameAndPassword: async (req, res, next) => {
        try {
            const username = req.body.username;
            const password = req.body.password;
            const keepLogin = req.body.keepLogin;
            const user = await userService.getUserbyUsernameAndPassword(username, password);

            if (user == 'Not found user') {
                res.status(200).send('notJoinedUser');
            } else if (user == 'Not match password') {
                res.status(200).send('notMatchedPassword');
            } else {
                if (keepLogin) {
                    req.session.user = {
                        iskeepLogin: true,
                        id: user.id,
                        nickname: user.nickname,
                        profileImg: user.profileImg
                    }
                } else {
                    req.session.user = {
                        id: user.id,
                        nickname: user.nickname,
                        profileImg: user.profileImg
                    }
                }
                res.status(200).send('ok');
            }
        } catch (error) {
            next(error);
        }
    },

    checkUserbyUsername: async (req, res, next) => {
        try {
            const username = req.params.username;
            const hasUser = await userService.checkUserbyUsername(username);

            res.status(200).send(hasUser);
        } catch (error) {
            next(error);
        }
    },

    checkUserbyNickname: async (req, res, next) => {
        try {
            const nickanme = req.params.nickanme;
            const hasUser = await userService.checkUserbyNickname(nickanme);

            res.status(200).send(hasUser);
        } catch (error) {
            next(error);
        }
    },

    updateUserImage: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const filename = req.file.filename;
            const imageName = await userService.updateUserImage(userId, filename);

            req.session.user.profileImg = imageName;
            res.status(200).send(imageName);
        } catch (error) {
            next(error);
        }

    },

    deleteUserImage: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const imageName = await userService.updateUserImage(userId, null);

            req.session.user.profileImg = imageName;
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    },

    getUsersByEmail: async (req, res, next) => {
        try {
            const userEmail = req.params.email;
            const users = await userService.getUsersByEmail(userEmail);

            res.status(200).send(users);
        } catch (error) {
            next(error);
        }
    },

    deleteUserById: async (req, res) => {
        try {
            const userId = req.session.user.id;

            await userService.deleteUserById(userId);
            req.session.destroy((error) => { throw error; });
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    },

    loginSnsUser: async (req, res, next) => {
        try {
            const code = req.query.code;
            const token = req.query.state;
            const snsType = req.path.slice(7);

            console.log(req.session.auth.CSRFToken)
            console.log(token)

            if(req.session.auth.CSRFToken != token) throw 'Bad request';
            const snsUserData = await userService.getUserFromSns(code, token, snsType);

            if (!await userService.isUserExistInDb(snsUserData.user)) {
                await userService.createSnsUser(snsUserData.user);
            }
            
            const user = await userService.getUserBySnsId(snsUserData.user.snsId, snsUserData.user.snsType);
            if (user) {
                req.session.user = {
                    id: user.id,
                    snsType: user.snsType,
                    nickname: user.nickname,
                    profileImg: user.profileImg,
                    refreshToken: snsUserData.token.refreshToken
                };
                res.redirect('/');
            } else {
                throw 'Not found';
            }
        } catch (error) {
            next(error);
        }
    },

    deleteSnsUser: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const snsType = req.session.user.snsType;
            const code = req.query.code;
            const token = req.query.state;
            
            if(req.session.auth.CSRFToken == token) {
                await userService.deleteSnsUser(userId, snsType, code, token);
                req.session.destroy((error) => {
                    if (error) throw error;
                    res.redirect('/');
                });
            } else {
                throw 'Bad Request';
            }

        } catch (error) {
            next(error);
        }
    },

    logoutUser: async (req, res, next) => {
        try {
            req.session.destroy((error) => {
                if (error) throw error;
                res.sendStatus(204);
            });
        } catch (error) {
            next(error);
        }
    },

    requestToDeleteSnsUser: async (req, res, next) => {
        try {
            const snsType = req.session.user.snsType;
            const kakaoKey = process.env.KAKAO_REST_KEY;
            const naverClientId = process.env.NAVER_CLIENT_ID;
            const callbackUrl = encodeURI(process.env.AUTH_CALLBACK_URI);
            const state = encodeURI(await cryptoUtility.createRandomHash(128, 'hex'));
            const naverApi_url = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" +
                naverClientId + '&redirect_uri=' + callbackUrl + "delete/naver" + '&state=' + state;
            const kakaoApi_url = "https://kauth.kakao.com/oauth/authorize?&response_type=code&client_id=" +
                kakaoKey + '&redirect_uri=' + callbackUrl + "delete/kakao" + '&state=' + state;

            req.session.auth = { sns: { state: state }}
            if (snsType == 'kakao') {
                res.status(200).send(kakaoApi_url);
            } else if (snsType == 'naver') {
                res.status(200).send(naverApi_url);
            } else {
                throw 'Forbidden';
            }
        } catch (error) {
            next(error);
        }
    },

    getUserProfileByUserId: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const userData = await userService.getUserProfileByUserId(userId);
            if (userData) {
                req.session.auth = {
                    CSRFToken: await cryptoUtility.createRandomHash(64, 'base64')
                }
                res.render('users/profile', {
                    "pageTitle": process.env.PAGE_TITLE,
                    "username": userData.name,
                    "profileImg": userData.profileImg,
                    "nickname": userData.nickname,
                    "email": userData.email,
                    "snsType": userData.snsType,
                    "CSRFToken": req.session.auth.CSRFToken
                });
            } else {
                throw 'Not found';
            }
        } catch (error) {
            next(error);
        }

    },

    updateNicknameByUserId: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            const nickname = req.body.nickname;

            await userService.updateNicknameByUserId(userId, nickname);
            req.session.user.nickname = nickname;
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    },

    updateEmailByUserId: async (req, res, next) => {
        try {
            const email = req.body.email;
            const userId = req.session.user.id;

            await userService.updateEmailByUserId(userId, email);
            delete req.session.auth.updateEmail;
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    },

    updatePasswordByUserId: async (req, res, next) => {
        try {
            const password = req.body.newPswd;
            const userId = req.session.user.id;

            await userService.updatePasswordByUserId(userId, password);
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    },

    createAndSendResetPasswordAuth: async (req, res, next) => {
        try {
            const username = req.params.username;
            const email = req.params.email;
            const token = await authService.createResetPasswordAuth(username);

            await authService.sendResetPasswordEmail(username, email, token);
            res.status(200).json({
                email: email
            });
        } catch (error) {
            next(error);
        }
    },

    updatePasswordByToken: async (req, res, next) => {
        try {
            const token = req.body.token;
            const password = req.body.password;
            const username = await authService.getResetPswdUserByToken(token);

            await userService.updatePasswordByUsername(username, password);

            delete req.session.auth.resetPswd;
            res.status(200).send('OK');
        } catch (error) {
            next(error);
        }
    },

    createAndSendJoinAuth: async (req, res, next) => {
        try {
            const userData = req.body;
            const username = req.body.username;
            const email = req.body.email;
            const token = await authService.createJoinAuth(userData);

            await authService.sendJoinUserEmail(username, email, token);
            res.status(200).json({
                email: email
            });
        } catch (error) {
            next(error);
        }
    },

    deleteUser: async (req, res, next) => {
        try {
            const userId = req.session.user.id;
            await userService.deleteUser(userId);

            res.status(200);
        } catch (error) {
            next(error);
        }
    }
}