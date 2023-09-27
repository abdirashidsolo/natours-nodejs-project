const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};
//
const createTokenAndSend = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('JWT', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(409)
      .json({ status: 'fail', message: 'Email is invalid or already taken' });

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    active: false,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createTokenAndSend(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) check if user provide email and password
  if (!email || !password)
    return next(new AppError('Please provide email and password'), 400);

  // 2) Check if the user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  // const correctPassword = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password'), 401);
  }

  // 3) if everthing is ok send token
  createTokenAndSend(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) cheking if token is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('Your are not logged in! please login', 401));
  }

  // 2) Verification toke
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist', 401)
    );
  }

  // 4) Check if user changed password
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Password changed recently please log in again', 401)
    );
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo = (...roles) => {
  const role = roles;
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to do this action', 403)
      );
    }

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user pased on posted Email Address
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email.', 404));
  }

  // 2) Generate random token reset password
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) create tokenURL and then Send to user's email
  try {
    const tokenURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    await new Email(user, tokenURL).sendResetPassword();

    res
      .status(200)
      .json({ Status: 'success', Message: 'Reset token sent to the email' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // console.log(error);
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending reset token. Please try again leter!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user pased on posted Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if token not exired and there is user  set new password
  if (!user) {
    return next(new AppError('Invalid or expired token!.', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 3) Update passwordChangedAt property for the user

  createTokenAndSend(user, 200, res);
  // const token = signToken(user._id);

  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection

  const user = await User.findById(req.user._id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong'), 401);
  }

  // 3) If so, upadate the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log user in, send JWT
  createTokenAndSend(user, 200, res);
});
