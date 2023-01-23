require('dotenv').config();
const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');

// tell passport to use new strategy for google oauth
passport.use(new googleStrategy({
        clientID: process.env.CLIENTID,
        clientSecret: process.env.CLIENTSECRET,
        callbackURL: process.env.CALLBACKURL
    },
    function(accessToken, refreshToken, profile, done){
        // find a user
        User.findOne({email: profile.emails[0].value}).exec(function(err, user){
            if(err){console.log('Error in google strategy-passport, ',err);return;}

            // if user found, then set the user as req.user
            if(user){
                return done(null, user);
            } else {
                // if not found , then create a user and set that user as req.user
                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: crypto.randomBytes(20).toString('hex')
                }, function(err, user){
                    if(err){console.log('Error in creating a user in google strategy-passport, ',err);return;}

                    return done(null, user);
                });
            }
        });
    }

));

module.exports = passport;