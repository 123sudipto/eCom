const User = require("../models/User");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const createSendToken = require("../utils/signToken");

exports.signUp = catchAsync(async (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    // return res.status(400).json({
    //   status: "error",
    //   message: "Missing required fields",
    // });
    return next(new AppError("Missing required fields", 400));
  }
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    // return res.status(400).json({
    //   status: "error",
    //   message: "User already exists",
    // });
    return next(new AppError("User already exists", 409));
  }

  const newUser = await User.create(req.body);

  // res.status(201).json({
  //   status: "Success",
  //   data: newUser,
  // });

  createSendToken(newUser, 201, res);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // return res.status(400).json({
    //   status: "error",
    //   message: "Missing required fields",
    //   });
    return next(new AppError("Missing required fields", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    // return res.status(401).json({
    //   status: "error",
    //   message: "Invalid email or password",
    //   });
    return next(new AppError("Invalid email or password", 401));
  }
  const isCorrect = await user.correctPassword(password, user.password);
  if (!isCorrect) {
    // return res.status(401).json({
    //   status: "error",
    //   message: "Incorrect email or password",
    //   });
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});