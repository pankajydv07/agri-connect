import {
    GET_ORDERS,
    GET_ORDER,
    CREATE_ORDER,
    UPDATE_ORDER,
    CANCEL_ORDER,
    ORDER_ERROR,
    CLEAR_ORDER,
    SET_LOADING
  } from '../actions/types';
  
  const initialState = {
    orders: [],
    order: null,
    loading: false,
    error: null
  };
  
  export default function orderReducer(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case GET_ORDERS:
        return {
          ...state,
          orders: payload.data,
          loading: false
        };
      case GET_ORDER:
        return {
          ...state,
          order: payload,
          loading: false
        };
      case CREATE_ORDER:
        return {
          ...state,
          orders: [payload, ...state.orders],
          loading: false
        };
      case UPDATE_ORDER:
      case CANCEL_ORDER:
        return {
          ...state,
          orders: state.orders.map(order =>
            order._id === payload._id ? payload : order
          ),
          order: payload,
          loading: false
        };
      case ORDER_ERROR:
        return {
          ...state,
          error: payload,
          loading: false
        };
      case CLEAR_ORDER:
        return {
          ...state,
          order: null,
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
  