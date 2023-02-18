require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

const naverId = process.env.NAVER_CLIENT_ID;
const kakaoKey = process.env.KAKAO_REST_KEY;
const naverSecret = process.env.NAVER_CLIENT_SECRET;
const callbackUri = encodeURI(process.env.AUTH_CALLBACK_URI);

router.get('/kakao', async (req, res) => {
    userController.getUserFromKakao(req, res);
});



router.get('/naver', async (req, res) => {
    userController.getUserFromNaver(req, res);
});

router.get('/naver/delete', async (req, res) => {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const access_token = 'AAAAOvRmzUUOaa57fuPcaEblFNtTB4CGksRTG5TjGjx1Kfehf4s54B0PcfMM2RCgSBNZdMsZqkWZ98NngPbvwcIL2gU';
    const api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=' + naverId + '&client_secret=' + naverSecret + '&access_token=' + access_token;
    
    const response = await fetch(api_url).then((response) => response.json());
    res.send(response);
});

router.get('/naver/reauth', async (req, res) => {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const state = 'random_state';
    const api_url = 'https://nid.naver.com/oauth2.0/authorize?auth_type=reauthenticate&client_id=' + naverId + '&redirect_uri='
    + callbackUri + "naver/re" + '&response_type=code&state=' + state;
    console.log(api_url);
    const response = await fetch(api_url).then((response) => response);

    res.send(response);
});

router.get('/naver/re', async (req, res) => {
    const response = await authenticate(req);
    res.send(response);
})

async function authenticate(req) {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const code = req.query.code;
    const state = req.query.state;
    const api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
                    + naverId + '&client_secret=' + naverSecret + '&redirect_uri='
                    + callbackUri + "naver"+ '&code=' + code + '&state=' + state;
    const response = await fetch(api_url).then((response) => response.json());

    return response
}

module.exports = router;