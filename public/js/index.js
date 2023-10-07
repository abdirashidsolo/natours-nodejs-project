/* eslint-disable */
import '@babel/polyfill';
import 'regenerator-runtime/runtime';
import { displayMap } from './leaflet';
import {
  login,
  logout,
  forgotPassword,
  saveResetPassword,
  addlikedTours,
} from './login';
import { updateData, updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { signup } from './signup';

// ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const bookBtn = document.getElementById('book-tour');
const signupForm = document.querySelector('.form--signup');
const forgotForm = document.querySelector('.forgot-form');
const saveResetForm = document.querySelector('.saveReset-form');
const likedHeart = document.querySelector('.detail__heartIcon');
const favouriteBtn = document.querySelector('.header__favourite');
const userView = document.querySelector('.user-view');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(
    document.getElementById('map').dataset.locations
  );

  displayMap(locations);
}

if (loginForm)
  document.querySelector('.form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (signupForm)
  document
    .querySelector('.form')
    .addEventListener('submit', async function (e) {
      e.preventDefault();
      // console.log('Submited');
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const passwordConfirm = document.getElementById(
        'signup-passwordConfirm'
      ).value;
      document.querySelector('.btn--singup').textContent = 'Signing Up...';
      await signup({ name, email, password, passwordConfirm });
      document.querySelector('.btn--singup').textContent = 'Sign Up';
    });

///LOG OUT
if (logoutBtn)
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

if (userDataForm) {
  document.getElementById('photo').addEventListener('change', (e) => {
    e.preventDefault();
    const imgUrl = URL.createObjectURL(
      document.getElementById('photo').files[0]
    );
    document.querySelector('.form__user-photo').src = imgUrl;
  });
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateData(form);
  });
}
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    // console.log({ passwordCurrent, password, passwordConfirm });

    await updateSettings(passwordCurrent, password, passwordConfirm);
    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
    // e.target.textContent = 'Book tour now!';
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

// FORGOT FORM
if (forgotForm)
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#emailForgot').value;
    console.log(email);
    forgotPassword(email);
  });

if (saveResetForm)
  document.querySelector('.form--saveReset').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.querySelector('#saveResetBtn').dataset.userId;
    console.log(id);
    const password = document.querySelector('#resetPassword').value;
    const passwordConfirm = document.querySelector(
      '#resetPasswordConfirm'
    ).value;
    saveResetPassword(password, passwordConfirm, id);
  });

// Like and Unlike implementations

if (likedHeart) {
  likedHeart.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(likedHeart.dataset.like);
    const { id } = likedHeart.dataset;
    if (likedHeart.dataset.like === 'unlike') addlikedTours('add', id);
    else addlikedTours('remove', id);
  });
}

// Display favourite
if (favouriteBtn) {
  favouriteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('clicked');
    document.querySelector('.favourite__container').classList.toggle('visible');
  });
}
