const User = 'user';
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
        
        userService.getUserFromKakao(code, state, (err, user) => {
            if (err) {
                res.status(500).send('Error getting naver user by token.');
            } else {
                if (user) {
                    // userService.getUserById();
                    // userService.saveUserToSession(req, userId, (err) => {
                    //     if(err) throw err;
                    // });
                    // req.session.userId = 'get the user from table in Db';
                    // req.session.isLodin = true
                    res.status(200).send(user);
                } else {
                    res.status(404).send('Not found naver user');
                }
            }
        });
    },

    getUserFromNaver: async (req, res) => {
        const code = req.query.code;
        const state = req.query.state;
        
        userService.getUserFromNaver(code, state, (err, user) => {
            if (err) {
                res.status(500).send('Error getting naver user by token.');
            } else {
                if (user) {
                    // userService.getUserById();
                    // userService.saveUserToSession(req, userId, (err) => {
                    //     if(err) throw err;
                    // });
                    // req.session.userId = 'get the user from table in Db';
                    // req.session.isLodin = true
                    res.status(200).send(user);
                } else {
                    res.status(404).send('Not found naver user');
                }
            }
        });
    },
    
    createUserByNaverUser: (req, res) => {
        auth
        const userData = user;
        const userName = user.properties.nickname;

        userService.createUser()
    }
}