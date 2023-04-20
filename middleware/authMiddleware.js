const AuthService = require("../services/authService");
const CryptoUtility = require("../utilities/cryptoUtility");

module.exports = {
    verifyCSRFToken: async (req, res, next) => {
        try {
            const splitedPath = req.path.split('/');
            
            // 웹 페이지 로드시 CSRF 토큰 생성
            if(splitedPath[1] == '' || splitedPath[2] == 'login' || splitedPath[2] == 'profile') {
                if(splitedPath.length <= 3) {
                    const token = await CryptoUtility.createRandomHash(64, 'hex');
                    req.session.auth = { CSRFToken: token }
                }
            }
            
            if(req.query.state) { // SNS 소셜 연동 CSRF 체크
                const state = req.query.state;
                if(req.session.auth.CSRFToken == state) {
                    next();
                } else {
                    throw 'Unauthorized';
                }
            } else if (/^(GET|HEAD|OPTIONS)$/.test(req.method)) { // GET|HEAD|OPTIONS 메소드 CSRF 체크 패스
                next();
            } else {
                // CSRF 체크
                if(req.session.auth.CSRFToken == req.headers['csrf-token']) {
                    next();
                } else {
                    throw 'Unauthorized';
                }
            }
        } catch (error) {
            next(error);
        }
    },

    verifyRecaptcha: async (req, res, next) => {
        try {
            const recaptcha = req.body.recaptcha;
            const response = await AuthService.verifyRecaptcha(recaptcha);

            if (response.success === true) {
                next();
            } else {
                throw 'Unauthorized';
            }
        } catch (error) {
            next(error);
        }
    },

    refreshSession: async (req, res, next) => {
        try {
            if (req.session.user) {
                const elapsedTime = req.session.cookie.originalMaxAge - req.session.cookie.maxAge;
                const refreshTime = 5 * 60 * 1000;
                
                if (elapsedTime > refreshTime) {
                    const oneWeek = 7 * 24 * 60 * 60 * 1000;
                    const user = req.session.user;
                    const auth = req.session.auth;
                    const category = req.session.category;
                    const isKeepLogin = req.session.user.iskeepLogin;
                    
                    req.session.regenerate(async (error) => {
                        if (error) throw error;
                        if (isKeepLogin == true || user.snsType) {
                            req.session.cookie.maxAge = oneWeek;
                            req.session.cookie.expries = new Date(Date.now() + oneWeek);
                        }
                        req.session.user = user;
                        req.session.auth = auth;
                        req.session.category = category
                        
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
            if(req.session.auth == undefined) throw 'Forbidden';
            const isAuth = req.session.auth.resetPswd.isAuth;
            
            if (isAuth == true) {
            } else {
                throw 'Unauthorized';
            }
        } catch (error) {
            next(error);
        }
    },

    verifyPswd: async (req, res, next) => {
        try {
            const password = req.body.currentPswd;
            const userId = req.session.user.id;
            const isAuth = await AuthService.verifyPswdByUserId(userId, password);
            const token = req.session.auth.token;
            if (isAuth == true && token) {
                next();
            } else {
                throw 'Unauthorized';
            }
        } catch (error) {
            next(error);
        }
    }
}