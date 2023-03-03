const User = 'user';
const session = require('express-session');
const userService = require('../services/userService');

module.exports = {

    getAllUsers: (req, res) => {
        userService.getAllUsers((err, users) => {
            if (err) {
                res.status(500).send('Error getting all users');
            } else {
                res.status(200).send(users);
            }
        });
    },

    getUser: async (req, res) => {
        const userId = req.body.userId;
        const password = req.body.password;
        await userService.getUserbyUsernameAndPassword(userId, password, (error, user) => {
            if(error) {
                error.status = 400
                next(error);
            } else {
                req.session.user.id = user.id;
                req.session.user.nickname = user.nickname;
                req.session.user.image = user.image;
                res.status(200).send('Login success');
            }
        });
    },

    uploadUserImage: async (req, res) => {
        
        const filename = req.file.filename;
        const userId = req.session.user.id;
        console.log(filename);

        userService.uploadUserImage(userId, filename, (err, filename) => {
            if (err) {
                res.status(500).send('Error getting all users');
            } else {
                res.status(200).send(filename);
            }
        });
    },

    getUserById: (req, res) => {
        const userId = req.parms.id;
        const userData = req.body;

        userService.getUserById((err, user) => {
            if (err) {
                res.status(500).send('Error getting user by id');
            } else {
                if (user) {
                    res.status(200).send(user);
                } else {
                    res.status(404).send('Not found user');
                }
            }
        });
    },

    getUserByEmail: (req, res) => {
        const userEmail = req.body.email;

        userService.getUserByEmail(userEmail, (err, user) => {
            if (err) {
                res.status(500).send('Error getting user by id');
            } else {
                if (user) {
                    console.log(user);
                    res.status(200).json(user);
                } else {
                    res.status(404).send('Not found user');
                }
            }
        });
    },

    createUser: (req, res) => {
        const userData = req.body;
        console.log(userData);
        
        userService.createUser(userData, (err, user) => {
            if(err) {
                res.status(500).send('Error creating user');
            } else {
                if (user) {
                    res.status(200).send(user);
                } else {
                    res.status(404).send('Not found user data');
                }
            }
        })
    },

    updateUserById: (req, res) => {
        const userId = req.session.user_id;
        const userData = req.body;

        userService.updateUserById(userId, userData, (err, user) => {
            if (err) {
                res.status(500).send('Error updating user by id');
            } else {
                if (user) {
                    res.status(200).send(user);
                } else {
                    res.status(404).send('Not found user');
                }
            }
        });
    },

    deleteUserById: (req, res) => {
        const userId = req.session.user_id;

        userService.deleteUserById(userId, (err, user) => {
            if (err) {
                res.status(500).send();
            } else {
                if (user) {
                    res.status(200).send(user);
                } else {
                    res.status(404).send('Not found user');
                }
            }
        });
    },

    getUserFromKakao: async (req, res) => {
        const code = req.query.code;
        const state = req.query.state;
        
        Service.getUserFromKakao(code, state, async (err, userData) => {
            if (err) {
                res.status(500).send('Error getting naver user by token.');
            } else {
                if (userData) {
                    if(await userService.isUserExistInDb(userData)) {
                        userService.getUserBySnsId(userData.snsId, userData.snsType);
                    } else {
                        userService.createSnsUser(userData);
                    }
                    req.session.user.snsId;
                    req.session.user.nickname;
                    req.session.user.id;

                    res.status(200).send(req.session.user);
                } else {
                    res.status(404).send('Not found naver user');
                }
            }
        });
    },

    loginSnsUser: async (req, res) => {
        try {
            const code = req.query.code;
            const state = req.query.state;
            const snsType = req.path.slice(1);
            const userData = await userService.getUserFromSns(code, state, snsType);
    
            if(!await userService.isUserExistInDb(userData)) {
                await userService.createSnsUser(userData);
            }

            await userService.getUserBySnsId(userData.snsId, userData.snsType, (user) => {
                if (user) {
                    req.session.user = {
                        id: user.id,
                        snsType: user.snsType,
                        nickname: user.nickname
                    };
                    res.redirect('/tasks');
                } else {
                    res.status(404).send('Not found naver user');
                }
            });
        } catch (err) {
            res.status(500).send('Error getting naver user.' + err);
        }
    },

    logoutUser: async (req, res) => {
        try {
            console.log('logout msg');
            req.session.destroy((err) => {
                if(err) throw err;
                res.sendStatus(204);
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Error getting naver user.' + err);
        }
    },

    getEmailByUser: async (req, res) => {
        try {
            const userId = req.session.user.id;
            userService.getEmailByUser(userId, (error, userData) => {
                if(error) throw error;
                if(userData) {
                    res.render('users/profile', {
                        "pageTitle": process.env.PAGE_TITLE,
                        "username": req.session.user.name,
                        "userimg": req.session.user.img,
                        "nickname": req.session.user.nickname,
                        "email": userData.email,
                        "snsType": userData.snsType
                    });
                } else {
                    throw 'Not found email';
                }
            });
        } catch (error) {
            console.log(error);
            res.status(500).send('Error getting naver user.' + error);
        }
    }
}