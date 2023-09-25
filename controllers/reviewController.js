const factory = require('./handleFactory');
const Review = require('../Models/reviewModel');
// const Tour = require('../Models/tourModel');

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
