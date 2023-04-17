const authService = require("../services/authService");

module.exports = {
    refreshSessionData: async (req, res, next) => {
        try {
            if (req.session.user) {
                const elapsedTime = req.session.cookie.originalMaxAge - req.session.cookie.maxAge;
                const refreshTime = 1000;

                if (elapsedTime > refreshTime) {
                    const user = req.session.user;
                    const auth = req.session.auth;
                    const category = req.session.category;

                    req.session.regenerate(async (error) => {
                        if (error) throw error;
                        req.session.user = user;
                        req.session.auth = auth;
                        req.session.category = category;

                        req.session.save((error) => {
                            if (error) throw error;
                        });
                        next();
                    });
                } else {
                    next();
                }
            } else {
                next();
            }
        } catch (error) {
            next(error);
        }
    },

    isLogined: (req, res, next) => {
        try {
            const splitedPath = req.path.split('/');

            console.log(splitedPath)

            if(splitedPath[1] == 'categories' || splitedPath[1] == 'tasks' || splitedPath[2] == 'profile') {
                if(!req.session.user) {
                    res.redirect('/users/login');
                } else {
                    next();
                }
            } else {
                next();
            }
        } catch (error) {
            next(error);
        }
    },

    isAuthUpdateEmail: (req, res, next) => {
        try {
            const isAuth = req.session.auth.updateEmail.isAuth;
            const email = req.session.auth.updateEmail.email;
            const requestEmail = req.body.email;

            if (isAuth == true && email == requestEmail) {
                next();
            } else {
                throw 'Unauthorized';

            }
        } catch (error) {
            next(error);
        }
    },

    isAuthResetPswd: (req, res, next) => {
        try {
            next();
            // if(req.session.auth == undefined) throw 'Forbidden';
            // const isAuth = req.session.auth.resetPswd.isAuth;
            
            // if (isAuth == true) {
            // } else {
            //     throw 'Unauthorized';
            // }
        } catch (error) {
            next(error);
        }
    },

    verifyPswd: async (req, res, next) => {
        try {
            const password = req.body.currentPswd;
            const userId = req.session.user.id;
            const isAuth = await authService.verifyPswdByUserId(userId, password);

            if (isAuth == true) {
                next();
            } else {
                throw 'Unauthorized';
            }
        } catch (error) {
            next(error);
        }
    }
}