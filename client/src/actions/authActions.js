import axios from 'axios';
import { setAlert } from './alertActions';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS
} from './types';
import setAuthToken from '../utils/setAuthToken';

// Load User
export const loadUser = () => async dispatch => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/auth/me');

    dispatch({
      type: USER_LOADED,
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    });
  }
};

// Register User
export const register = (formData) => async dispatch => {
  try {
    const res = await axios.post('/api/auth/register', formData);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.message;

    if (errors) {
      dispatch(setAlert(errors, 'danger'));
    }

    dispatch({
      type: REGISTER_FAIL
    });
  }
};

// Login User
export const login = (email, password) => async dispatch => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({ email, password });

  try {
    const res = await axios.post('/api/auth/login', body, config);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });

    dispatch(loadUser());
  } catch (err) {
    const errors = err.response.data.message;

    if (errors) {
      dispatch(setAlert(errors, 'danger'));
    }

    dispatch({
      type: LOGIN_FAIL
    });
  }
};

// Update profile
export const updateProfile = (formData) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const res = await axios.put('/api/auth/profile', formData, config);

    dispatch({
      type: USER_LOADED,
      payload: res.data.data
    });

    dispatch(setAlert('Profile Updated', 'success'));
  } catch (err) {
    const errors = err.response.data.message;

    if (errors) {
      dispatch(setAlert(errors, 'danger'));
    }

    dispatch({
      type: AUTH_ERROR
    });
  }
};

// Change password
export const changePassword = (passwordData) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    await axios.put('/api/auth/change-password', passwordData, config);

    dispatch(setAlert('Password Changed Successfully', 'success'));
    
    return true;
  } catch (err) {
    const errors = err.response.data.message;

    if (errors) {
      dispatch(setAlert(errors, 'danger'));
    }
    
    return false;
  }
};


// Logout
export const logout = () => dispatch => {
  dispatch({ type: LOGOUT });
};

// Clear Errors
export const clearErrors = () => dispatch => {
  dispatch({ type: CLEAR_ERRORS });
};
