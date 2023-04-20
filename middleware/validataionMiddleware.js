const { User } = require('../models/todoModel');
const idFormat = /^[\w-]{5,20}$/;
const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;
const usernameFormat = /^[\w|가-힣]{2,10}$/;
const authCodeFormat = /\b\d{5}\b/;

module.exports = {
    verifyPswdFormat: (req, res, next) => {
        try {
            if (pswdFormat.test(req.body.password)) {
                next();
            } else {
                throw 'Bad request';
            }
        } catch (error) {
            next(error);
        }
    },

    verifyUpdatePswd: (req, res, next) => {
        try {
            const newPswd = req.body.newPswd;
            const currentPswd = req.body.currentPswd;
            if (newPswd != currentPswd) {
                if (pswdFormat.test(req.body.newPswd) && pswdFormat.test(req.body.currentPswd)) {
                    next();
                } else {
                    throw 'Bad request';
                }
            } else {
                throw 'Same password';
            }
        } catch (error) {
            next(error);   
        }
    },

    verifyJoin: async (req, res, next) => {
        try {
            if (!idFormat.test(req.body.username) || !emailFormat.test(req.body.email) || !pswdFormat.test(req.body.password)) {
                throw 'Bad request';
            } else {
                const userData = req.body;
                const result = await isUserJoined(userData);
                
                if(result) {
                    res.status(200).send(message);
                } else {
                    next();
                }
            }
        } catch (error) {
            next(error);
        }
    },

    verifyLogin: async (req, res, next) => {
        try {
            if (!idFormat.test(req.body.username) || !pswdFormat.test(req.body.password)) {
                throw 'Bad request';
            } else {
                next();
            }
        } catch (error) {
            next(error);
        }
    },

    verifyFindPswd: async (req, res, next) => {
        try {
            if (!idFormat.test(req.params.username) || !emailFormat.test(req.params.email)) {
                throw 'Bad request';
            } else {
                const userData = req.params;
                const result = await isUserJoined(userData);
    
                if (result == 'joinedUser') {
                    next();
                } else {
                    res.status(200).send('notJoinedUser');
                }
            }
        } catch (error) {
            next(error);
        }
    },

    verifyEmail: async (req, res, next) => {
        const currentEmail = req.body.currentEmail;
        const userId = req.session.user.id;

        if (emailFormat.test(currentEmail)) {
            checkEmailMatch(userId, currentEmail, (error) => {
                if (error) {
                    next(error);
                } else {
                    next();
                }
            });
        } else {
            const error = new Error('Bad Request');
            error.status = 401;
            next(error);
        }
    },

    verifyEmailFormatAndAuthCode: (req, res, next) => {
        const authCode = req.query.code;
        const email = req.query.email;

        if (authCodeFormat.test(authCode) && emailFormat.test(email)) {
            next();
        } else {
            const error = new Error('Bad request');
            error.status = 401;
            next(error);
        }
    },

    verifyCategorySession: (req, res, next) => {
        if (req.session.category && req.session.user) {
            next();
        } else {
            req.session.category = {};
            req.session.category.id = null;
            req.session.category.name = '작업';
            req.session.save();
            next();
        }
    }
}

async function checkEmailMatch(userId, email, callback) {
    await User.count({
        where: {
            id: userId,
            email: email
        }
    }).then(response => {
        if (response == 1) {
            callback(null);
        } else {
            const error = new Error('Not Found');
            error.status = 404;
            callback(error);
        }
    }).catch(error => {
        error.status = 500;
        callback(error);
    });
}

async function isUserJoined(userData) {
    const response = await User.findAndCountAll({
        attributes: ['name'],
        where: {
            email: userData.email,
            snsId: null
        }
    });

    if (response.count > 3) {
        return 'limitJoinedEmail';
    } else {
        for (const user of response.rows) {
            if (user.name == userData.username) {
                return 'joinedUser';
            }
        }
        return null;
    }
}