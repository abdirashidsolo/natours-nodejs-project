const Tour = require('../Models/tourModel');
const User = require('../Models/userModel');
const Review = require('../Models/reviewModel');
const Booking = require('../Models/bookingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getForgetForm = (req, res, next) => {
  res.status(200).render('forgetForm', {
    title: 'Forgot my password',
  });
};

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
    title: 'In Your account',
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

exports.displayReviewSection = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tourId = (await Tour.findOne({ slug: req.params.slug })).id;
    // console.log(`Ueser: ${userId}`);
    // console.log(`Tour: ${tourId}`);

    const booking = await Booking.findOne({ tour: tourId, user: userId });

    if (!booking) return next();

    res.locals.showReviewSection = true;

    const review = await Review.findOne({ tour: tourId, user: userId });

    if (!review) {
      res.locals.userRatedTour = false;
      return next();
    }

    res.locals.userRatedTour = true;

    next();
  } catch (error) {
    console.log(error);
    return next();
  }
};

exports.renderFavourite = async (req, res, next) => {
  if (!req.user) return next();

  const userId = req.user.id;

  const tours = (await User.findById(userId)).liked;
  // console.log(tours);

  const favourites = [];

  await Promise.all(
    tours.map(async (id) => {
      const tour = await Tour.findById(id);
      favourites.push(tour);
    })
  );
  // console.log(favourites);
  res.locals.favourites = favourites;
  next();
};
