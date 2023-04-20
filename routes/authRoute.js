require('dotenv').config();
const express = require('express');
const Router = express.Router();
const AuthController = require('../controllers/authController');
const ValidataionMiddleware = require('../middleware/validataionMiddleware');

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