require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const naverId = process.env.NAVER_CLIENT_ID;
const kakaoKey = process.env.KAKAO_REST_KEY;
const naverSecret = process.env.NAVER_CLIENT_SECRET;
const callbackUri = encodeURI(process.env.AUTH_CALLBACK_URI);

module.exports = {
    getTokenFromKakao: async (code, state , callback) => {
        const fetch = (...args) => import('note-fetch').then(({ default: fetch }));
        const params = new URLSearchParams();
        const api_url = 'https://kauth.kakao.com/oauth/token';
        params.append('grant_type', "authorization_code");
        params.append('client_id', kakaoKey);
        params.append('code', code);
        params.append('redirect_uri', callbackUri + "kakao");

        const token = await fetch(api_url, {
            method: "POST",
            headers:{ "Content-type": "application/x-www-form-urlencoded"},
            body: params
        }).then((token) => token.json());

        if(token) {
            callback(err, null);
        } else {
            callback(null, token);
        }
    },

    getKaKaoUserByToken: async (token, callback) => {
        const authorization = token.token_type + " " + token.access_token;
        const user = await fetch("https://kapi.kakao.com/v2/user/me", {
            method: "GET",
            headers: { 'Authorization': authorization }
        }).then((response) => response.json());

        if(user) {
            callback(err, null);
        } else {
            callback(null, user);
        }
    },

    getTokenFromNaver: async (code, state , callback) => {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

        const api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
                        + naverId + '&client_secret=' + naverSecret + '&redirect_uri='
                        + callbackUri + "naver"+ '&code=' + code + '&state=' + state;
        const token = await fetch(api_url).then((token) => token.json());
        
        if(token) {
            callback(err, null);
        } else {
            callback(null, token);
        }
    },

    getNaverUserByToken: async (token, callback) => {
        const authorization = token.token_type + " " + token.access_token;
        console.log(token.access_token);
        const user = await fetch('https://openapi.naver.com/v1/nid/me', {
            Accept: "*/*",
            headers: { 'X-Naver-Client-Id':naverId,
                        'X-Naver-Client-Secret': naverSecret,
                        'Authorization': authorization
                    }
        }).then((user) => user.json());

        if(user) {
            callback(err, null);
        } else {
            callback(null, user);
        }
    },

    deleteNaverUserByToken: async (token, callback) => {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const access_token = 'AAAAOvRmzUUOaa57fuPcaEblFNtTB4CGksRTG5TjGjx1Kfehf4s54B0PcfMM2RCgSBNZdMsZqkWZ98NngPbvwcIL2gU';
        const api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=delete&client_id=' + naverId + '&client_secret=' + naverSecret + '&access_token=' + access_token;
        
        const response = await fetch(api_url).then((response) => response.json());
        res.send(response);
    },

    refreshToken: async (req, res) => {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const state = 'random_state';
        const api_url = 'https://nid.naver.com/oauth2.0/authorize?auth_type=reauthenticate&client_id=' + naverId + '&redirect_uri='
        + callbackUri + "naver/re" + '&response_type=code&state=' + state;
        console.log(api_url);
        const response = await fetch(api_url).then((response) => response);
    
        res.send(response);
    }
}