const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
// const bookingController = require('../controllers/bookingController');
// const userController = require('../controllers/userController');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/verify/:token', authController.verifyUser);
router.get('/forgotPassword', viewsController.getForgetForm);

router.get(
  '/',
  authController.isLoggedIn,
  viewsController.renderFavourite,
  viewsController.getOverview
);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/signup', authController.isLoggedIn, viewsController.getSignupForm);
router.get('/welcome', authController.isLoggedIn, viewsController.getWelcome);
router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  viewsController.renderFavourite,
  viewsController.displayReviewSection,
  viewsController.getTour
);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);
router.post(
  '/submit-user-password',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
