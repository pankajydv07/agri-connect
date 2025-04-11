import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import setAuthToken from './utils/setAuthToken';
import { loadUser } from './actions/authActions';

// Components
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';
import PrivateRoute from './components/routing/PrivateRoute';
import RoleRoute from './components/routing/RoleRoute';

// Pages
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Marketplace from './pages/marketplace/Marketplace';
import ProductDetail from './pages/marketplace/ProductDetail';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddProduct from './pages/farmer/AddProduct';
import EditProduct from './pages/farmer/EditProduct';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import OrderDetail from './pages/orders/OrderDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

// Check for token in localStorage
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Alert />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/marketplace" component={Marketplace} />
              <Route exact path="/products/:id" component={ProductDetail} />
              
              <PrivateRoute exact path="/orders/:id" component={OrderDetail} />
              
              <RoleRoute 
                exact 
                path="/farmer/dashboard" 
                component={FarmerDashboard} 
                role="farmer" 
              />
              <RoleRoute 
                exact 
                path="/farmer/products/add" 
                component={AddProduct} 
                role="farmer" 
              />
              <RoleRoute 
                exact 
                path="/farmer/products/edit/:id" 
                component={EditProduct} 
                role="farmer" 
              />
              
              <RoleRoute 
                exact 
                path="/buyer/dashboard" 
                component={BuyerDashboard} 
                role="buyer" 
              />
              
              <RoleRoute 
                exact 
                path="/admin/dashboard" 
                component={AdminDashboard} 
                role="admin" 
              />
              
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
