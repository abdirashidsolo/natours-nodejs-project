/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51NsQP3LXBw8GLfrPsorvnsSy4YqMZqumHJ3qOydRwHn2QSw6A9CHAxpp5YDPT2zNZx5YzW7j91pF0d1gnBHeRQs0006dzFbWet'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Chechout session from API
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);
    // 2) Create checkout form and charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert('error', error.massage);
  }
};
