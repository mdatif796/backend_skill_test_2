const User = require("../models/user");
const Token = require("../models/token");
const crypto = require("crypto");
const queue = require("../config/kue");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const forgetPasswordMailer = require("../workers/forgetPassword_emails_worker");

// render the sign-in page
module.exports.sign_in = function (req, res) {
  // if the user is already signed in
  if (req.isAuthenticated()) {
    req.flash("error", "User already Signed In!");
    return res.redirect("/");
  }
  // if the user is not signed in
  return res.render("sign_in", {
    site_key: process.env.CAPTCHA_SITE_KEY,
  });
};

// render the sign-up page
module.exports.sign_up = function (req, res) {
  // if the user is already signed in
  if (req.isAuthenticated()) {
    req.flash("error", "User already Signed In!");
    return res.redirect("/");
  }
  // if the user is not signed in
  return res.render("sign_up", {
    site_key: process.env.CAPTCHA_SITE_KEY,
  });
};

// controller for creating a user
module.exports.create_user = async function (req, res) {
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
        } else {
          // if captcha is not verified
          req.flash("error", "captcha not verified!!");
          return res.redirect("/users/sign-in");
        }
      });
    // if both the password doesn't match
    if (req.body.password != req.body.confirm_password) {
      req.flash("error", "Password does not match");
      return res.redirect("back");
    }

    // find the user with the provided email
    let user = await User.findOne({ email: req.body.email });
    // if the user doesn't exist then creat that user
    if (!user) {
      bcrypt.genSalt(10, (err, Salt) => {
        bcrypt.hash(req.body.password, Salt, async (err, hash) => {
          await User.create({
            email: req.body.email,
            name: req.body.name,
            password: hash,
          });
        });
      });
      req.flash("success", "User Created Successfully");
      return res.redirect("/users/sign-in");
      // if the user exist then we simply redirect back
    } else {
      req.flash("error", "User Exist!");
      return res.redirect("back");
    }
  } catch (err) {
    console.log("err: ", err);
    req.flash("error", err);
    return res.redirect("back");
  }
};

// controller for creating a session that is sign in
module.exports.create_session = function (req, res) {
  // sending the flash messages to the req
  req.flash("success", "Logged in Successfully!");
  return res.redirect("/");
};

// sign out controller
module.exports.destroySession = async function (req, res) {
  try {
    // inbuilt function for logout provided by passport
    req.logout((err) => {
      if (err) {
        req.flash("error", err);
        return;
      }
      // sending the flash messages to the req
      req.flash("success", "You have Logged Out!");
      return res.redirect("/");
    });
  } catch (err) {
    req.flash("error", err);
    return res.redirect("/");
  }
};

module.exports.resetPasswordPage = async (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("resetPassword");
  }
  return res.redirect("/users/sign-in");
};

module.exports.resetPassword = async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      let user = req.user;
      bcrypt.genSalt(10, (err, Salt) => {
        bcrypt.hash(req.body.password, Salt, async (err, hash) => {
          user.password = hash;
        });
      });
      await user.save();
      req.flash("success", "Password reset successfully");
      return res.redirect("/");
    }
  } catch (error) {
    req.flash("error", "Error");
    return res.redirect("back");
  }
};

module.exports.forgetPasswordPage = async (req, res) => {
  return res.render("forget_password", {
    token: "",
  });
};

module.exports.forgetPasswordEmail = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("success", "Email does not exist");
      return res.redirect("back");
    }

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await Token.create({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
    }

    token = await token.populate("userId", "name email");

    let job = queue.create("forgetPasswordEmail", token).save((err) => {
      if (err) {
        console.log("Error in creating a job", err);
        return;
      }
      console.log(job.id);
    });

    req.flash("success", "Password forget email sent!");
    return res.redirect("/");
  } catch (error) {
    console.log("error: ", error);
    req.flash("error", "Error");
    return res.redirect("back");
  }
};

module.exports.forgetPasswordVerify = async (req, res) => {
  let user = await User.findById(req.params.userId);
  console.log("user: ", user);
  if (!user) {
    req.flash("error", "User not exit");
    return res.redirect("/users/sign-in");
  }

  let token = await Token.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!token) {
    req.flash("error", "Token or Link Expired!");
    return res.redirect("/users/sign-in");
  }

  await token.populate("userId", "_id");

  if (!req.body.password) {
    return res.render("forget_password", {
      token: token,
    });
  }

  if (req.body.password !== req.body.confirm_password) {
    req.flash("error", "password and confirm password does not match");
    return res.redirect("back");
  }

  bcrypt.genSalt(10, (err, Salt) => {
    bcrypt.hash(req.body.password, Salt, async (err, hash) => {
      user.password = hash;
      await user.save();
      await token.delete();

      req.flash("success", "Password Changed Successfully!");
      return res.redirect("/");
    });
  });
};
