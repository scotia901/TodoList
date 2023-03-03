const { response } = require('express');
const { User } = require('../models/userModel');

module.exports = {
    preventBruteforce: (req, res) => {
        if (req.session.tryLogin > 5) {
            res.status(200).send('You try to login more then 5 times');
        } else if(req.session.isLogined == true){
            next();
        } else {
            req.session.tryLogin += 1;
        }
    }
}

const idFormat = /^[\w-]{5,20}$/;
const emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const pswdFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,20}$/;
const usernameFormat = /^[\w|가-힣]{2,10}$/

async function verifyJoinForm(err, req, res, next) {
    if (!idFormat.test(req.body.user_id) || !emailFormat.test(req.body.email) || !pswdFormat.test(req.body.password)) {
        res.status(400).send('유효하지 않는 데이터');
    } else {
        User.findAndCountAll({
            where: {
                email: email
            }
        }).then(response => {
            if(response.count > 3) {
                new Error ('This email has limited join because avaliable join 3user per email')
            }
        }).then(response => {
            if(response.user.id == req.body.userId) {
                new Error ('This ID already has joined this site.')
            } else {
                next();
            }
        }).catch(error => {
            console.error(error);
            throw error;
        });
    }
}

if(usernameFormat.test(req.body.username)) {
    next();
} else {
    new Error('Error: Invalied username');
}

if(emailFormat.test(req.body.email)) {
    next();
} else {
    new Error('Error: Invalied email');
}