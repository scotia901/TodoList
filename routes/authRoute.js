require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express');
const Router = express.Router();
const AuthController = require('../controllers/authController');
const ValidataionMiddleware = require('../middleware/validataionMiddleware');

const naverId = process.env.NAVER_CLIENT_ID;
const kakaoKey = process.env.KAKAO_REST_KEY;
const naverSecret = process.env.NAVER_CLIENT_SECRET;
const callbackUri = encodeURI(process.env.AUTH_CALLBACK_URI);

Router.get('/naver/delete', async (req, res) => {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const access_token = 'AAAAOvRmzUUOaa57fuPcaEblFNtTB4CGksRTG5TjGjx1Kfehf4s54B0PcfMM2RCgSBNZdMsZqkWZ98NngPbvwcIL2gU';
    const api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=' + naverId + '&client_secret=' + naverSecret + '&access_token=' + access_token;
    
    const response = await fetch(api_url).then((response) => response.json());
    res.send(response);
});

Router.get('/naver/reauth', async (req, res) => {
    AuthController.getTokenFromNaver(req, res);
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const state = 'random_state';
    const api_url = 'https://nid.naver.com/oauth2.0/authorize?auth_type=reauthenticate&client_id=' + naverId + '&redirect_uri='
    + callbackUri + "naver/re" + '&response_type=code&state=' + state;
    const response = await fetch(api_url).then((response) => response);

    res.send(response);
});

Router.get('/password', async (req, res, next) => {
    AuthController.authResetPassword(req, res, next);
});

Router.post('/code',ValidataionMiddleware.verifyEmail, async (req, res, next) => {
    AuthController.sendAuthCode(req, res, next);
});

Router.get('/code',ValidataionMiddleware.verifyEmailFormatAndAuthCode, async (req, res, next) => {
    AuthController.authUpdateEmail(req, res, next);
});

Router.get('/join', async (req, res, next) => {
    AuthController.authJoin(req, res, next);
});

module.exports = Router;