const express = require('express');

// setting up the router
const router = express.Router();
const userController = require('../controllers/userController');

const passport = require('passport');

// get request for '/user/sign-in' from browser
router.get('/sign-in', userController.sign_in);
// get request for '/user/sign-up' from browser
router.get('/sign-up', userController.sign_up);

// post request for creating a user
router.post('/create-user', userController.create_user);

// post request for creating a session
router.post('/create-session', passport.authenticate('local', {failureRedirect: '/users/sign-in'}),
    userController.create_session
);

// reset password
router.get('/sign-in/reset-password-page', userController.resetPasswordPage);
router.post('/sign-in/reset-password', userController.resetPassword);

// forget password routes 
router.get('/sign-in/forget-password-page', userController.forgetPasswordPage);
router.post('/sign-in/forget-password-email', userController.forgetPasswordEmail);
router.get('/sign-in/forget-password/:userId/:token', userController.forgetPasswordVerify);
router.post('/sign-in/forget-password/:userId/:token', userController.forgetPasswordVerify);

// get request for sign out
router.get('/sign-out', passport.checkAuthentication, userController.destroySession);
router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));
router.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/users/sign-in'}), userController.create_session);


module.exports = router;