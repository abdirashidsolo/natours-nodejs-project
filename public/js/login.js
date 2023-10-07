/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (username, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email: username,
        password,
      },
      withCredentials: true,
    });

    document.cookie = `jwt=${res.data.token}; max-age=10080min`;
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(function () {
        location.assign('/');
      }, 1500);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status == 'success') {
      location.reload(true);
      location.assign('/');
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! Try again.');
  }
};

// FORGET PASSWORD

export const forgotPassword = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgetPassword',
      data: { email: email },
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password reset link sent to the email');
      window.setTimeout(function () {
        location.assign('/');
      }, 1500);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};

// FORGET PASSWORD

export const saveResetPassword = async (password, passwordConfirm, id) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/saveResetPassword/${id}`,
      data: { password: password, passwordConfirm: passwordConfirm },
      withCredentials: true,
    });

    document.cookie = `jwt=${res.data.token}; max-age=10080min`;
    if (res.data.status === 'success') {
      showAlert('success', 'Password changed successfully');
      window.setTimeout(function () {
        location.assign('/');
      }, 1500);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};

// Like and Unlike
export const addlikedTours = async (liked, id) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/liked/${id}`,
      data: { liked: liked },
      withCredentials: true,
    });

    let message;
    if (liked === 'add') message = 'Tour added your favourite';
    else message = 'Tour removed your favourite';

    if (res.data.status === 'success') {
      showAlert('success', message);
      window.setTimeout(function () {
        location.reload(true);
      }, 1000);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};
