const APIFeatures = require('../utils/apifeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('Not found document with this id', 404));
    }
    res.status(204).json({
      status: 'Suceces',
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('Not found document with this id', 404));
    }
    res.status(200).json({
      status: 'Suceces',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(200).json({
      status: 'Success',
      data: {
        date: doc,
      },
    });
  });

exports.getOne = (Model, popOtions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOtions) query = query.populate('reviews');
    const doc = await query;

    if (!doc) {
      return next(new AppError('Not found document with this id', 404));
    }
    res.status(200).json({
      status: 'Suceces',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    /// EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query;
    const doc = await features.query;
    // const query = await Tour.find().where('duration').equals(5);
    // SEND RESPONSE
    res.status(200).json({
      status: 'Suceces',
      // requstedat: req.requestedTime,
      result: doc.length,

      data: {
        data: doc,
      },
    });
  });
