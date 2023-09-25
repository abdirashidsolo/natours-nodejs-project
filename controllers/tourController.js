const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../Models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');

const multerStorage = multer.memoryStorage();

// STEP 2: CREATE FILTER OBJE
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image!, please upload only images', 400), false);
  }
};

// STEP 3: USE THE ABOVE OBTION OBJECTS
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'images', maxCount: 3 },
  { name: 'imageCover', maxCount: 1 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.images || !req.files.imageCover) return next();

  // Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //Images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  next();
});

// upload.single("fieldName")
// upload.array('fildname', 5);

exports.aliasTopTours = (req, res, next) => {
  /// This my own implementation of the top-5tours
  // let query = Tour.find();
  // query = query.sort('ratingsAverage price');
  // query.select('name price ratingsAverage summery difficulty');
  // query = query.limit(5);
  // const tours = await query;
  // res.status(200).json({
  //   status: 'Suceces',
  //   // requstedat: req.requestedTime,
  //   result: tours.length,
  //   data: {
  //     tours,
  //   },
  // });
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
  next();
};
// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.getToursDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the form of lat,lang',
        400
      )
    );
  }

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  const tours = await Tour.aggregate([
    {
      $geoNear: {
        // key: 'startLocation', if several indexes there
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    tours: tours.length,
    data: {
      tours,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in the form of lat,lang',
        400
      )
    );
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'Success',
    tours: tours.length,
    data: {
      tours,
    },
  });
});

// exports.getAlltours = catchAsync(async (req, res, next) => {
// (req.query);
// BUILD QUERY
// // 1) filtering
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'fields', 'limit'];
// excludedFields.forEach((field) => delete queryObj[field]);

// // (req.query);

// // 1A) advanced filtering
// let objectStr = JSON.stringify(queryObj);

// objectStr = objectStr.replace(
//   /\b(gte|gt|lte|lt)\b/g,
//   (match) => `$${match}`
// );

// let query = Tour.find(JSON.parse(objectStr));

// // 2) Sorting
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   query.sort('-createdAt');
// }

// // 3)Liminting Fields
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

// 4) Pagination
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numberOftours = await Tour.countDocuments();
//   if (skip >= numberOftours) throw new Error('This page is not found');
// }

/// EXECUTE QUERY
// const features = new APIFeatures(Tour.find(), req.query)
//   .filter()
//   .sort()
//   .limitFields()
//   .paginate();
// const tours = await features.query;
// // const query = await Tour.find().where('duration').equals(5);
// // SEND RESPONSE
// res.status(200).json({
//   status: 'Suceces',
//   // requstedat: req.requestedTime,
//   result: tours.length,

//   data: {
//     tours,
//   },
// });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   // (req.params.id);
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // const tour = await Tour.findById(req.params.id).populate({
//   //   path: 'guides',
//   //   select: '-__v',
//   // });
//   //Tour.findOne({_id: req.params.id})

//   if (!tour) {
//     return next(new AppError('Not found tour with this id', 404));
//   }
//   res.status(200).json({
//     status: 'Suceces',
//     data: {
//       tour,
//     },
//   });
// });

// Creating a new tour
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(200).json({
//     status: 'Success',
//     data: newTour,
//   });
// });

//UPDATING TOURS
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('Not found tour with this id', 404));
//   }
//   res.status(200).json({
//     status: 'Suceces',
//     data: {
//       tour,
//     },
//   });
// });

// DELETING TOURS
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('Not found tour with this id', 404));
//   }
//   res.status(204).json({
//     status: 'Suceces',
//     data: 'Null',
//   });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        ratingsQuantity: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgRating: -1,
      },
    },

    // {
    //   // $match: {
    //   //   _id: { $ne: 'EASY' },
    //   // },
    // },
  ]);
  res.status(200).json({
    status: 'Suceces',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTtourStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
  ]);

  res.status(200).json({
    status: 'Suceces',
    data: plan,
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
