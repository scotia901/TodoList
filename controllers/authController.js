const authService = require("../services/authService");
const userService = require("../services/userService");

module.exports = {
    getTokenFromKakao: (req, res) => {
        const code = req.query.code;
        const state = req.query.state;

        authService.getTokenFromKakao(code, state, (err, token) => {
            if (err) {
                res.status(500).send('Error getting token form kakao');
            } else {
                if (token) {
                    return token
                } else {
                    res.status(404).send('Not found token');
                }
            }
        });

    },

    getKakaoUserByToken: (req, res) => {
        const token = req.body;

        authService.getKakaoUserByToken(token, (err, user) => {
            if (err) {
                res.status(500).send('Error getting kakao user by token');
            } else {
                if (user) {
                    return user
                } else {
                    res.status(404).send('Not found kakao user');
                }
            }
        });
    },

    createUserByKakaoUser: (req, res) => {
        const userData = user;
        const userName = user.properties.nickname;

        userService.createUser()
    },
    
    getTokenFromNaver: async (req, res) => {
        const code = req.query.code;
        const state = req.query.state;

        const token = await authService.getTokenFromNaver(code, state, (err, token) => {
            if (err) {
                res.status(500).send('Error getting naver token.' + err);
            } else {
                if (token) {
                    authService.getNaverUserByToken(token, (err, user) => {
                        if (err) {
                            res.status(500).send('Error getting kakao user by token');
                        } else {
                            if (user) {
                                res.status(200).send(user);
                            } else {
                                res.status(404).send('Not found kakao user');
                            }
                        }
                    });
                } else {
                    res.status(404).send('Not found naver token');
                }
            }
        });


    },

    getNaverUserByToken: async (token, req, res) => {
        authService.getNaverUserByToken(token, (err, user) => {
            if (err) {
                res.status(500).send('Error getting naver user by token.');
            } else {
                if (user) {
                    res.status(200).send(user);
                } else {
                    res.status(404).send('Not found naver user');
                }
            }
        });
    },


}