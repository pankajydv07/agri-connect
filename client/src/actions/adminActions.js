import axios from 'axios';
import { setAlert } from './alertActions';
import {
  GET_USERS,
  GET_STATS,
  DELETE_USER,
  ADMIN_ERROR,
  SET_LOADING
} from './types';

// Get all users
export const getUsers = () => async dispatch => {
  try {
    dispatch({ type: SET_LOADING });
    
    const res = await axios.get('/api/admin/users');

    dispatch({
      type: GET_USERS,
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: ADMIN_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};

// Get admin stats
export const getStats = () => async dispatch => {
  try {
    dispatch({ type: SET_LOADING });
    
    const res = await axios.get('/api/admin/stats');

    dispatch({
      type: GET_STATS,
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: ADMIN_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};

// Delete user
export const deleteUser = id => async dispatch => {
  if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    try {
      await axios.delete(`/api/admin/users/${id}`);

      dispatch({
        type: DELETE_USER,
        payload: id
      });

      dispatch(setAlert('User Deleted', 'success'));
    } catch (err) {
      dispatch({
        type: ADMIN_ERROR,
        payload: { msg: err.response.data.message, status: err.response.status }
      });
    }
  }
};
