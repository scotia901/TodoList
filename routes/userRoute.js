require('dotenv').config();
const express = require('express');
const Router = express.Router();
const UploadFileMiddleware = require('../middleware/uploadFileMiddleware');
const ValidataionMiddleware = require('../middleware/validataionMiddleware');
const AuthMiddleware = require('../middleware/authMiddleware');
const UserController = require('../controllers/userController');

Router.get('/login', (req, res, next) => {
    UserController.renderLoginPage(req, res, next);
});

Router.get('/login/:snstype', (req, res, next) => {
    UserController.loginSnsUser(req, res, next);
});

Router.delete('/delete/user', (req, res, next) => {
    UserController.deleteUserById(req, res, next);
});

Router.delete('/delete/snsuser', (req, res, next) => {
    UserController.requestToDeleteSnsUser(req, res, next);
});

Router.get('/delete/:snstype', (req, res, next) => {
    UserController.deleteSnsUser(req, res, next);
});

Router.get('/delete/:snstype', (req, res, next) => {
    UserController.deleteUserById(req, res, next);
});

Router.post('/login', ValidataionMiddleware.verifyLogin, AuthMiddleware.verifyRecaptcha, (req, res, next) => {
    UserController.getUserByUsernameAndPassword(req, res, next);
});

Router.get('/logout', (req, res, next) => {
    UserController.logoutUser(req, res, next);
});

Router.get('/find/id', (req, res) => {
    UserController.renderFindIdPage(req, res);
});

Router.get('/find/id/:email', (req, res, next) => {
    UserController.getUsersByEmail(req, res, next);
});

Router.get('/find/pswd', (req, res) => {
    UserController.renderFindPasswordPage(req, res);
});

Router.get('/find/pswd/:username/:email', ValidataionMiddleware.verifyFindPswd, (req, res, next) => {
    UserController.createAndSendResetPasswordAuth(req, res, next);
});

Router.get('/find/pswd/reset', AuthMiddleware.isAuthResetPswd, (req, res, next) => {
    UserController.renderResetPasswordPage(req, res, next);
});

Router.put('/find/pswd/reset', ValidataionMiddleware.verifyPswdFormat, (req, res, next) => {
    UserController.updatePasswordByToken(req, res, next);
});

Router.get('/join', (req, res) => {
    UserController.renderJoinPage(req, res);
});

Router.get('/username/:username', (req, res, next) => {
    UserController.checkUserbyUsername(req, res, next);
});

Router.get('/nickname/:nickanme', (req, res, next) => {
    UserController.checkUserbyNickname(req, res, next);
});

Router.post('/join', ValidataionMiddleware.verifyJoin, (req, res, next) => {
    UserController.createAndSendJoinAuth(req, res, next);
});

Router.get('/profile', (req, res, next) => {
    UserController.getUserProfileByUserId(req, res, next);
});

Router.post('/profile/img', UploadFileMiddleware.single('uploaded-file'), (req, res, next) => {
    UserController.updateUserImage(req, res, next);
});

Router.delete('/profile/img', (req, res, next) => {
    UserController.deleteUserImage(req, res, next);
});

Router.put('/update/email', AuthMiddleware.isAuthUpdateEmail, (req, res, next) => {
    UserController.updateEmailByUserId(req, res, next);
});

Router.put('/update/pswd', ValidataionMiddleware.verifyUpdatePswd, AuthMiddleware.verifyPswd, (req, res, next) => {
    UserController.updatePasswordByUserId(req, res, next);
});

Router.put('/profile/edit/nickname', (req, res, next) => {
    UserController.updateNicknameByUserId(req, res, next);
});

Router.get('/profile/edit/password', (req, res) => {
    UserController.renderUpdatePasswordPage(req, res);
});

Router.get('/profile/edit/email', (req, res) => {
    UserController.renderUpdateEmailPage(req, res);
});

module.exports = Router;