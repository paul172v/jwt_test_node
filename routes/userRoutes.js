const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(authController.protectAndRestrictTo("user"), userController.getAll);

router.route("/signup").post(authController.signup);

router.route("/login").post(authController.login);

router.route("/forgot-password").post(authController.forgotPassword);

router.route("/reset-password/:resetToken").patch(authController.resetPassword);

module.exports = router;
