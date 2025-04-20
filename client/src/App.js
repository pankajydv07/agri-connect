// src/App.js - Update your existing App.js file

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import setAuthToken from './utils/setAuthToken';
import { loadUser } from './actions/authActions';

// Import i18n
import './i18n';

// Components
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';
import PrivateRoute from './components/routing/PrivateRoute';
import RoleRoute from './components/routing/RoleRoute';
import Chatbot from './components/chatbot/Chatbot';
import LearnHome from './pages/learn/LearnHome';

import ModernTechnology from './pages/learn/ModernTechnology';
import EcoFriendlyFarming from './pages/learn/EcoFriendlyFarming';
// Pages
import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Marketplace from './pages/marketplace/Marketplace';
import ProductDetail from './pages/marketplace/ProductDetail';
import ToolsMarketplace from './pages/tools/ToolsMarketplace';
import ToolDetails from './pages/tools/ToolDetails';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AddProduct from './pages/farmer/AddProduct';
import EditProduct from './pages/farmer/EditProduct';
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import OrderDetail from './pages/orders/OrderDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import Profile from './pages/profile/Profile';
import OrganicFarming from './pages/organic/OrganicFarming';
import NotFound from './pages/NotFound';
import CropRecommendation from './components/crop/CropRecommendation';
import NGOMarketplace from './pages/marketplace/NGOMarketplace';

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
          <Chatbot />
          <div className="container mx-auto px-4 py-8">
            <Alert />
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/marketplace" component={Marketplace} />
              <Route exact path="/ngo-marketplace" component={NGOMarketplace} />
              <Route exact path="/products/:id" component={ProductDetail} />
              <Route exact path="/tools-marketplace" component={ToolsMarketplace} />
              <Route exact path="/tools/:toolId" component={ToolDetails} />

              <PrivateRoute exact path="/profile" component={Profile} />
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
                role={['buyer', 'ngo_buyer']}
              />

              <RoleRoute
                exact
                path="/admin/dashboard"
                component={AdminDashboard}
                role="admin"
              />
              // SDG Knowledge Hub routes
              <Route exact path="/sdg-knowledge" component={LearnHome} />
              <Route exact path="/sdg-knowledge/organic-farming" component={OrganicFarming} />
              <Route exact path="/sdg-knowledge/modern-technology" component={ModernTechnology} />
              <Route exact path="/sdg-knowledge/eco-friendly" component={EcoFriendlyFarming} />
              <Route exact path="/crop-recommendation" component={CropRecommendation} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
