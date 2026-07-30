// Auth
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const USER_LOADED = 'USER_LOADED';
export const AUTH_ERROR = 'AUTH_ERROR';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const LOGOUT = 'LOGOUT';
export const CLEAR_ERRORS = 'CLEAR_ERRORS';

// Products
export const SET_PRODUCT_LOADING = 'SET_PRODUCT_LOADING';
export const GET_PRODUCTS = 'GET_PRODUCTS';
export const GET_PRODUCT = 'GET_PRODUCT';
export const ADD_PRODUCT = 'ADD_PRODUCT';
export const DELETE_PRODUCT = 'DELETE_PRODUCT';
export const UPDATE_PRODUCT = 'UPDATE_PRODUCT';
export const PRODUCT_ERROR = 'PRODUCT_ERROR';
export const CLEAR_PRODUCT = 'CLEAR_PRODUCT';

// Orders
export const SET_ORDER_LOADING = 'SET_ORDER_LOADING';
export const GET_ORDERS = 'GET_ORDERS';
export const GET_ORDER = 'GET_ORDER';
export const CREATE_ORDER = 'CREATE_ORDER';
export const UPDATE_ORDER = 'UPDATE_ORDER';
export const CANCEL_ORDER = 'CANCEL_ORDER';
export const ORDER_ERROR = 'ORDER_ERROR';
export const CLEAR_ORDER = 'CLEAR_ORDER';

// Admin
export const SET_ADMIN_LOADING = 'SET_ADMIN_LOADING';
export const GET_USERS = 'GET_USERS';
export const GET_STATS = 'GET_STATS';
export const ADMIN_ERROR = 'ADMIN_ERROR';
export const DELETE_USER = 'DELETE_USER';

// UI
export const SET_ALERT = 'SET_ALERT';
export const REMOVE_ALERT = 'REMOVE_ALERT';

// NOTE: a single shared SET_LOADING used to be dispatched by the product, order
// and admin actions, so any one slice's fetch flipped `loading` on all three
// (and the first response to land cleared the spinner for the others). Each
// slice now owns its own loading action: SET_PRODUCT_LOADING,
// SET_ORDER_LOADING, SET_ADMIN_LOADING.
