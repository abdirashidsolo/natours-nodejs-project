/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (username, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:8000/api/v1/users/login',
      data: {
        email: username,
        password,
        withCredentials: true,
      },
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
      url: 'http://127.0.0.1:8000/api/v1/users/logout',
    });
    if (res.data.status == 'success') {
      // console.log('Helo ther');
      location.reload(true);
    }

    console.log(res);
  } catch (err) {
    console.log(err);
    showAlert('error', 'Error logging out! Try again.');
  }
};
