/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

// type is either 'password' or 'data'
export const updateData = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/updateMe',
      data,
    });

    if ((res.data.status = 'success')) {
      showAlert('success', `Data updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const updateSettings = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:8000/api/v1/users/updateMyPassword',
      data: {
        passwordCurrent: data.passwordCurrent,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      },
    });

    if ((res.data.status = 'success')) {
      showAlert('success', `Password updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};
