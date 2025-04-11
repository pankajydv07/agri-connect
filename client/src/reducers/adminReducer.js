// In src/reducers/adminReducer.js
import {
    GET_USERS,
    GET_STATS,
    DELETE_USER,
    ADMIN_ERROR,
    SET_LOADING
  } from '../actions/types';
  
  const initialState = {
    users: [],
    stats: {
      users: { total: 0, farmers: 0, buyers: 0 },
      products: 0,
      orders: { total: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0 },
      totalSales: 0
    },
    loading: false,
    error: null
  };
  
  export default function adminReducer(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case GET_USERS:
        return {
          ...state,
          users: payload,
          loading: false
        };
      case GET_STATS:
        return {
          ...state,
          stats: payload,
          loading: false
        };
      case DELETE_USER:
        return {
          ...state,
          users: state.users.filter(user => user._id !== payload),
          loading: false
        };
      case ADMIN_ERROR:
        return {
          ...state,
          error: payload,
          loading: false
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
  