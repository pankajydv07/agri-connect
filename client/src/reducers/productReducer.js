import {
    GET_PRODUCTS,
    GET_PRODUCT,
    ADD_PRODUCT,
    DELETE_PRODUCT,
    UPDATE_PRODUCT,
    PRODUCT_ERROR,
    CLEAR_PRODUCT,
    SET_LOADING
  } from '../actions/types';
  
  const initialState = {
    products: [],
    product: null,
    loading: false,
    error: null,
    pagination: null
  };
  
  export default function productReducer(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case GET_PRODUCTS:
        return {
          ...state,
          products: payload.data,
          pagination: payload.pagination,
          loading: false
        };
      case GET_PRODUCT:
        return {
          ...state,
          product: payload,
          loading: false
        };
      case ADD_PRODUCT:
        return {
          ...state,
          products: [payload, ...state.products],
          loading: false
        };
      case UPDATE_PRODUCT:
        return {
          ...state,
          products: state.products.map(product =>
            product._id === payload._id ? payload : product
          ),
          product: payload,
          loading: false
        };
      case DELETE_PRODUCT:
        return {
          ...state,
          products: state.products.filter(product => product._id !== payload),
          loading: false
        };
      case PRODUCT_ERROR:
        return {
          ...state,
          error: payload,
          loading: false
        };
      case CLEAR_PRODUCT:
        return {
          ...state,
          product: null,
          error: null
        };
      case SET_LOADING:
        return {
          ...state,
          loading: true
        };
      default:
        return state;
    }
  }
  