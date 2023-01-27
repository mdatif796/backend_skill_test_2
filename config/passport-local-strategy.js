const passport = require("passport");
const fetch = require('isomorphic-fetch');
require('dotenv').config();

const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const User = require("../models/user");

// using passport middleware
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    async function (req, email, password, done) {
      try {

        // google captcha verification
        const response_key = req.body["g-recaptcha-response"];
        const secret_key = process.env.CAPTCHA_SECRET_KEY;
        const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
        fetch(url, {
          method: "post",
        })
          .then((response) => response.json())
          .then(async (google_response) => {
       
            // google_response is the object return by
            // google as a response
            if (google_response.success == true) {
              //   if captcha is verified

              // find the user using this email passed
              let user = await User.findOne({ email: email });
              // if user not found or password doesn't match
              if (!user) {
                req.flash("error", "Invalid username/password");
                // report to the passport that user doesn't exist
                return done(null, false);
              }
              bcrypt.compare(password, user.password, async (err, isMatch) => {
                console.log("isMatch: ", isMatch);
                if (!isMatch) {
                  req.flash("error", "Invalid username/password");
                  // report to the passport that user doesn't exist
                  return done(null, false);
                } else {
                  // report back to the passport that user exist and sends that user to passport
                  return done(null, user);
                }
              });
            } else {
              // if captcha is not verified
              req.flash("error", "captcha not verified!!");
              return res.redirect('/users/sign-in');
            }
          })
          .catch((error) => {
              // Some error while verify captcha
            console.log(error);
          });




        // // if user found
        // if (user) {
        //   // report back to the passport that user exist and sends that user to passport
        //   return done(null, user);
        // }
      } catch (err) {
        req.flash("error", "Error in finding the user --> passport");
        return done(err);
      }
    }
  )
);

// serializing the user to kept user id as a key in cookies
passport.serializeUser(function (user, done) {
  return done(null, user.id);
});

// deserializing the user to find the user using that key in the cookies
passport.deserializeUser(async function (id, done) {
  try {
    // find the user using that id present in the cookies
    let user = await User.findById(id);
    // if the user found then pass that user to the passport
    return done(null, user);
  } catch (err) {
    console.log("Error", err);
    return;
  }
});

// used as a middleware
passport.checkAuthentication = function (req, res, next) {
  // if the user is signed in
  if (req.isAuthenticated()) {
    return next();
  }

  // if the user is not signed in
  return res.redirect("/users/sign-in");
};

passport.setAuthenticatedUser = function (req, res, next) {
  // if the user is signed in then
  if (req.isAuthenticated()) {
    // req.user contains the current signed in user from the session cookies and we are just sending it to the locals for the views

    res.locals.user = req.user;
  }
  return next();
};

module.exports = passport;
