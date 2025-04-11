import axios from 'axios';
import { setAlert } from './alertActions';
import {
  GET_ORDERS,
  GET_ORDER,
  CREATE_ORDER,
  UPDATE_ORDER,
  CANCEL_ORDER,
  ORDER_ERROR,
  CLEAR_ORDER,
  SET_LOADING
} from './types';

// Get all orders
export const getOrders = () => async dispatch => {
  try {
    dispatch({ type: SET_LOADING });
    
    const res = await axios.get('/api/orders');

    dispatch({
      type: GET_ORDERS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: ORDER_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};

// Get single order
export const getOrder = id => async dispatch => {
  try {
    dispatch({ type: SET_LOADING });
    
    const res = await axios.get(`/api/orders/${id}`);
    console.log('Order response:', res.data);

    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to fetch order');
    }

    dispatch({
      type: GET_ORDER,
      payload: res.data.data
    });
  } catch (err) {
    console.error('Error fetching order:', err.response?.data || err.message);
    dispatch({
      type: ORDER_ERROR,
      payload: { 
        msg: err.response?.data?.message || err.message || 'Failed to fetch order',
        status: err.response?.status
      }
    });
  }
};

// Create new order
export const createOrder = (orderData) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const res = await axios.post('/api/orders', orderData, config);

    dispatch({
      type: CREATE_ORDER,
      payload: res.data.data
    });

    dispatch(setAlert('Order Placed Successfully', 'success'));
    
    return res.data.data;
  } catch (err) {
    dispatch({
      type: ORDER_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
    
    dispatch(setAlert(err.response.data.message, 'danger'));
    return null;
  }
};

// Update order status
export const updateOrderStatus = (id, status) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const res = await axios.put(`/api/orders/${id}`, { status }, config);

    dispatch({
      type: UPDATE_ORDER,
      payload: res.data.data
    });

    dispatch(setAlert(`Order ${status}`, 'success'));
  } catch (err) {
    dispatch({
      type: ORDER_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};

// Cancel order
export const cancelOrder = id => async dispatch => {
  if (window.confirm('Are you sure you want to cancel this order?')) {
    try {
      const res = await axios.put(`/api/orders/${id}/cancel`);

      dispatch({
        type: CANCEL_ORDER,
        payload: res.data.data
      });

      dispatch(setAlert('Order Cancelled', 'success'));
    } catch (err) {
      dispatch({
        type: ORDER_ERROR,
        payload: { msg: err.response.data.message, status: err.response.status }
      });
    }
  }
};

// Clear current order
export const clearOrder = () => dispatch => {
  dispatch({ type: CLEAR_ORDER });
};
