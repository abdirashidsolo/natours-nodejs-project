const Tour = require('../Models/tourModel');
const User = require('../Models/userModel');
const Booking = require('../Models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getWelcome = (req, res, next) => {
  res.status(200).render('userWelcome', {
    title: 'Welcome',
  });
};

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert)
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

exports.getOverview = catchAsync(async (req, res) => {
  // 1) We get all tours
  const tours = await Tour.find();

  // 2) We Template the tpurs

  // 3) We render our template using the tours we get from  step 1
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) We get tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    Feilds: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('Not found tour with that name', 404));
  }

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log in into your account',
  });
});

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Log in Your account',
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup an account',
  });
};

exports.getMyTours = async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIds = bookings.map((el) => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    status: 'success',
    tours,
  });
};

exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
