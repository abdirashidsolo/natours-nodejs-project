const factory = require('./handleFactory');
const Review = require('../Models/reviewModel');
const Booking = require('../Models/bookingModel');
const AppError = require('../utils/appError');
// const Tour = require('../Models/tourModel');

exports.checkWhetherBooked = async (req, res, next) => {
  const booked = await Booking.findOne({
    tour: req.body.tour,
    user: req.body.user,
  });

  if (!booked)
    next(
      new AppError(
        "You can't review, to review please book this tour first",
        401
      )
    );

  next();
};

// exports.getReviews = catchAysnc(async (req, res, next) => {

//   res.status(200).json({
//     status: 'success',
//     results: results.length,
//     data: {
//       results,
//     },
//   });
// });

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Create a new review
// exports.createReview = catchAysnc(async (req, res, next) => {
//   const review = await Review.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     message: 'Review created successfully',
//     data: {
//       review,
//     },
//   });
// });

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
