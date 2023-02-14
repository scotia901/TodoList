const authService = require("../services/authService");

module.exports = {
    getTokenFromKakao: (req, res) => {
        const code = req.query.code;
        const state = req.query.state;

        authService.getTokenFromKakao(code, state, (err, user) => {
            if (err) {

            } else {

            }
        });
    },

    getTokenFromNaver: (req, res) => {
        const code = req.query.code;
        const state = req.query.state;

        authService.getTokenFromNaver(code, state, (err, user) => {
            
        })
    }
}