const { promisify } = require("util");
require("dotenv").config({ path: "../config.env" });
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordChangedAt: req.body.passwordChangedAt,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({
      status: "success",
      message: "New user created",
      token,
      payload: newUser,
    });
  } catch (err) {
    res.status(501).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Do entered email and password exist? This is handled in React

    // Does user exist in the DB and is password correct?
    const user = await User.findOne({ email: email });

    if (!user || !(await user.correctPassword(password, user.password))) {
      console.log("Email or password are incorrect");
      return next();
    }

    // If all is okay send token to client
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: "success",
      message: "User is logged in",
      token,
      payload: user,
    });
  } catch (err) {
    res.status(501).json({
      status: "fail",
      message: err.message,
    });
  }
};

// roles is an array
exports.protectAndRestrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      // 1) Get token and check if it exists
      let token;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("jwt=Bearer ")
      ) {
        const placeholder = req.headers.authorization.split("jwt=Bearer ");
        token = placeholder[1];
      }

      if (!token) {
        console.log("❌ 401: No token, you are not logged in");
        return next(
          res.status(401).json({
            status: "fail",
            message: "No token, you are not logged in",
          })
        );
      }

      // 2) Verify token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );

      // 3) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        console.log("❌ User belonging to token not found");
        return next(
          res.status(401).json({
            status: "fail",
            message: "User belonging to token not found, you are not logged in",
          })
        );
      }

      // 4) Check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        console.log(
          "❌ 401: Password changed after token assigned, you are not logged in"
        );
        return next(
          res.status(401).json({
            status: "fail",
            message:
              "Password changed after token assigned, you are not logged in",
          })
        );
      }

      // 5: Conditional) Check if user's role matches the specified restricted roles
      if (roles.length > 0 && !roles.includes(currentUser.role)) {
        return next(
          res.status(403).json({
            status: "fail",
            message: "You do not have permission to perform this action",
          })
        );
      }
    } catch (err) {
      console.log(err.message);

      if (err.message === "Invalid signature") {
        console.log("❌ 401: Invalid signature, you are not logged in");
        return next(
          res.status(401).json({
            status: "fail",
            message: "Invalid signature, you are not logged in",
          })
        );
      }

      /* Both config.env and document.cookies (in React) should be set with expiry timer */
      /* Remember when changing JWT_EXPIRES_IN, server must be reset for changes to take effect */
      if (err.message === "jwt expired") {
        console.log("❌ jwt expired");
        return next(
          res.status(401).json({
            status: "fail",
            message: "JWT expired, you are not logged in",
          })
        );
      }
    }

    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      console.log("❌ No user found with this email!");
      return next(
        res.status(404).json({
          status: "fail",
          message: "No user found with this email, token could not be sent",
        })
      );
    }

    // 2) Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send token as email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `Forgot your password? Submit a patch request with your new password to ${resetUrl}. \n If you didn't forget your password please ignore this email`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10mins)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.log("❌ There was an error sending this email! try again later");
      return next(
        res.status(500).json({
          status: "fail",
          message: "There was an error sending this email, try again later",
        })
      );
    }
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.resetPassword = (req, res, next) => {};
