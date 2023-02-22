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
        
        userService.getUserFromKakao(code, state, async (err, userData) => {
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
            req.session.destroy(async (err) => {
                if(err) throw err;
                res.status(204).send();
            });
        } catch (err) {
            console.log(err);
            res.status(500).send('Error getting naver user.' + err);
        }
    }
}