const User = require("../models/userModel");

exports.getAll = async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      payload: users,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    res.status(200).json({
      status: "success",
      payload: user,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateOne = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      community: req.body.community,
    });

    res.status(201).json({
      status: "success",
      message: "User updated successfully",
    });
  } catch (err) {
    res.status(501).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteOne = async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.id);

    res.status(404).json({
      status: "success",
      message: "User removed successfully",
    });
  } catch (err) {
    res.status(501).json({
      status: "fail",
      message: err.message,
    });
  }
};
