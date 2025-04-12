import axios from 'axios';
import { setAlert } from './alertActions';
import {
  GET_PRODUCTS,
  GET_PRODUCT,
  ADD_PRODUCT,
  DELETE_PRODUCT,
  UPDATE_PRODUCT,
  PRODUCT_ERROR,
  CLEAR_PRODUCT,
  SET_LOADING
} from './types';

// Get all products
export const getProducts = (queryParams = '') => async dispatch => {
  try {
    dispatch({ type: SET_LOADING });
    
    const res = await axios.get(`/api/products${queryParams}`);

    dispatch({
      type: GET_PRODUCTS,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: PRODUCT_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};

// Get single product
export const getProduct = id => async dispatch => {
  try {
    dispatch({ type: SET_LOADING });
    
    const res = await axios.get(`/api/products/${id}`);

    dispatch({
      type: GET_PRODUCT,
      payload: res.data.data
    });
  } catch (err) {
    dispatch({
      type: PRODUCT_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};

// Add new product
export const addProduct = (formData) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    const res = await axios.post('/api/products', formData, config);

    dispatch({
      type: ADD_PRODUCT,
      payload: res.data.data
    });

    dispatch(setAlert('Product Added', 'success'));
  } catch (err) {
    dispatch({
      type: PRODUCT_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};

// Update product
export const updateProduct = (id, formData) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };

    const res = await axios.put(`/api/products/${id}`, formData, config);

    dispatch({
      type: UPDATE_PRODUCT,
      payload: res.data.data
    });

    dispatch(setAlert('Product Updated', 'success'));
  } catch (err) {
    dispatch({
      type: PRODUCT_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};

// Delete product
export const deleteProduct = id => async dispatch => {
  if (window.confirm('Are you sure you want to delete this product?')) {
    try {
      await axios.delete(`/api/products/${id}`);

      dispatch({
        type: DELETE_PRODUCT,
        payload: id
      });

      dispatch(setAlert('Product Removed', 'success'));
    } catch (err) {
      dispatch({
        type: PRODUCT_ERROR,
        payload: { msg: err.response.data.message, status: err.response.status }
      });
    }
  }
};

// Clear current product
export const clearProduct = () => dispatch => {
  dispatch({ type: CLEAR_PRODUCT });
};

// Update product status
export const updateProductStatus = (id, status) => async dispatch => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const res = await axios.put(`/api/products/${id}/status`, { status }, config);

    dispatch({
      type: UPDATE_PRODUCT,
      payload: res.data.data
    });

    dispatch(setAlert('Product status updated', 'success'));
  } catch (err) {
    dispatch({
      type: PRODUCT_ERROR,
      payload: { msg: err.response.data.message, status: err.response.status }
    });
  }
};
