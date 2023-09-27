/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (data) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      },
      //   withCredentials: true,
    });

    // document.cookie = `jwt=${res.data.token}; max-age=10080min`;
    if (res.data.status === 'success') {
      showAlert('success', 'Signup sended!');
      window.setTimeout(function () {
        location.assign('/welcome');
      }, 1500);
    }
  } catch (e) {
    console.log(e);
    showAlert('error', e.response.data.message);
  }
};
