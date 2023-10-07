const multer = require('multer');
const sharp = require('sharp');

const User = require('../Models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');

// STEP 1: CREATE STORAGE
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
// We moved image Storage into memmory in order next(Resize module) middleware to get access and manipulate the image
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

exports.uploadPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const objFilter = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateUserData = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // 1) check if user tries to update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. please use updateMypassword route to update',
        400
      )
    );
  }

  // 2) filter the unwanted out
  const filteredBody = objFilter(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    satus: 'success',
    message: 'User updated successfully',
    updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(200).json({
    satus: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   // const query = await Tour.find().where('duration').equals(5);
//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'Suceces',
//     // requstedat: req.requestedTime,
//     result: users.length,

//     data: {
//       users,
//     },
//   });
// });
exports.postUser = (req, res) => {
  res.status(500).json({
    message: 'This route is not allowed to create user use /signup',
  });
};

exports.addliked = async (req, res) => {
  const tourId = req.params.id;
  const { liked } = req.body;

  if (liked === 'add') {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { liked: tourId },
    });
  } else {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { liked: tourId },
    });
  }

  res.status(200).json({
    status: 'success',
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
