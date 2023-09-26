const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Services static files in our file system
app.use(express.static(path.join(__dirname, 'public')));

// Further HELMET configuration for Security Policy (CSP)
const scriptSrcUrls = [
  'https://js.stripe.com/v3/',
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://cdn.jsdelivr.net/npm/axios@1.3.3/dist/axios.min.js',
  'http://127.0.0.1:8000/',
  'http://localhost:8000/',
];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = [
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://cdn.jsdelivr.net/npm/axios@1.3.3/dist/axios.min.js',
  'http://127.0.0.1:8000',
  'http://localhost:8000 ',
];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet({
    directives: {
      defaultSrc: ['self'],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
// Setting Security headers
// app.use(helmet());

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:8000',
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//  Limit the request number ber hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, please try in an hour',
});

app.use('/api', limiter);

// Data Sanitize aggaint NnSQL query Injection
app.use(mongoSanitize());

// Data Sanitize aggaint XSS injection
app.use(xss());

// Prevent prameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.post(
  '/webhook-checkout',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

// Body barsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(bodyParser.json({ type: 'application/*+json' }));

app.use(compression());
// for testing
// app.use((req, res, next) => {
//   req.requestedTime = new Date().toISOString();
//   // console.log(req.cookies);
//   next();
// });

//Routes
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // 1) 1st version this code only sends a response that tells user that we can't find this url
  // res
  //   .status(404)
  //   .json({ status: 'Not Found', message: `Can't find ${req.originalUrl}` });

  /// 1) 2nd version this code creates an object Error and sets statuscode
  // and status properties of this error object then we jump over all middlewares which are not error handlers
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.statusCode = 404;
  // err.status = 'error';
  /// if we pass any parameters to next() method it will know that an error occurred and we will jump to the error handler middleware to handle

  next(
    new AppError(`Can't find this route ${req.originalUrl}in this server`, 404)
  );
});

app.use(globalErrorHandler);
module.exports = app;
