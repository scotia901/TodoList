const AuthService = require("../services/authService");
const UserService = require("../services/userService");

module.exports = {
    authResetPassword: async (req, res, next) => {
        try {
            const token = req.query.token;
            const hasToken = await AuthService.authResetPassword(token);

            if (hasToken) {
                req.session.auth = {
                    resetPswd: { isAuth: true }
                }
                res.redirect('/users/find/pswd/reset?token=' + token);
            } else {
                throw 'Not found';
            }
        } catch (error) {
            next(error);
        }
    },

    authJoin: async (req, res, next) => {
        try {
            const token = req.query.token;
            const user = await AuthService.getJoinUserByToken(token);

            if (user) {
                await UserService.createUser(user);
                res.render('welcome');
            } else {
                throw 'Not found';
            }
        } catch (error) {
            next(error);
        }
    },

    authUpdateEmail: async (req, res, next) => {
        try {
            const authCode = req.query.code;
            const email = req.query.email;
            const isAuth = await AuthService.authUpdateEmail(email, authCode);

            if (isAuth == true) {
                req.session.auth = {
                    updateEmail: {
                        isAuth: true,
                        email: email
                    }
                }
                res.status(200).send();
            } else {
                throw '인증 정보를 찾지 못하거나 시간이 만료되어 인증에 실패하였습니다.';
            }
        } catch (error) {
            next(error);
        }
    },

    sendAuthCode: async (req, res, next) => {
        try {
            const email = req.body.newEmail;
            const code = await AuthService.createUpdateEmailAuth(email);
            await AuthService.sendAuthCode(email, code);
            res.status(200).send();
        } catch (error) {
            next(error);
        }
    }
}