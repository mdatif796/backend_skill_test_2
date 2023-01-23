require('dotenv').config();
const passport = require('passport');

const passportJwtStrategy = require('passport-jwt').Strategy;
const passportExtractStrategy = require('passport-jwt').ExtractJwt;

const User = require('../models/user');

// passed as a header
const opts = {
    jwtFromRequest: passportExtractStrategy.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWTSECRETKEY
}

passport.use(new passportJwtStrategy(opts, function(jwtPayload, done){
    // find user by id which comes from jwtPayload 
    User.findById(jwtPayload._id, function(err, user){
        if(err){console.log('Error in finding the user in passportJwtStrategy, ', err); return done(err, false);}

        // if user found
        if(user){
            // then 
            return done(null, user);
        }else{
            return done(null, false);
        }
    });
}));

module.exports = passport;

