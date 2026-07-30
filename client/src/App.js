// src/App.js
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import setAuthToken from './utils/setAuthToken';
import { loadUser } from './actions/authActions';

// Import i18n (must be eager — initialises before any page renders)
import './i18n';

// Global chrome — must be eager so layout is never deferred
import Navbar from './components/layout/Navbar';
import Alert from './components/layout/Alert';
import PrivateRoute from './components/routing/PrivateRoute';
import RoleRoute from './components/routing/RoleRoute';
import Chatbot from './components/chatbot/Chatbot';

// Spinner used as Suspense fallback
import { SpinnerBlock } from './components/ui/Spinner.jsx';

// ---------------------------------------------------------------------------
// Route-level code splitting — every page is loaded only when its route is hit
// ---------------------------------------------------------------------------
const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/auth/Register'));
const Login = lazy(() => import('./pages/auth/Login'));
const Marketplace = lazy(() => import('./pages/marketplace/Marketplace'));
const ProductDetail = lazy(() => import('./pages/marketplace/ProductDetail'));
const NGOMarketplace = lazy(() => import('./pages/marketplace/NGOMarketplace'));
const ToolsMarketplace = lazy(() => import('./pages/tools/ToolsMarketplace'));
const ToolDetails = lazy(() => import('./pages/tools/ToolDetails'));
const CarbonFootprintCalculator = lazy(() => import('./pages/carbon/CarbonFootprintCalculator'));
const PestDetection = lazy(() => import('./pages/pest/PestDetection'));
const IpadWorkspace = lazy(() => import('./pages/dashboard/IpadWorkspace'));
const MaintenanceLogs = lazy(() => import('./pages/maintenance/MaintenanceLogs'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const OrderDetail = lazy(() => import('./pages/orders/OrderDetail'));
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const AddProduct = lazy(() => import('./pages/farmer/AddProduct'));
const EditProduct = lazy(() => import('./pages/farmer/EditProduct'));
const BuyerDashboard = lazy(() => import('./pages/buyer/BuyerDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const LearnHome = lazy(() => import('./pages/learn/LearnHome'));
const OrganicFarming = lazy(() => import('./pages/organic/OrganicFarming'));
const ModernTechnology = lazy(() => import('./pages/learn/ModernTechnology'));
const EcoFriendlyFarming = lazy(() => import('./pages/learn/EcoFriendlyFarming'));
const CropRecommendation = lazy(() => import('./components/crop/CropRecommendation'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ---------------------------------------------------------------------------
// Auth bootstrap — runs once before the first render
// ---------------------------------------------------------------------------
if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <SpinnerBlock label="Loading…" size="lg" tone="green" />
  </div>
);

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
            <Suspense fallback={<SuspenseFallback />}>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/marketplace" component={Marketplace} />
                <Route exact path="/ngo-marketplace" component={NGOMarketplace} />
                <Route exact path="/products/:id" component={ProductDetail} />
                <Route exact path="/tools-marketplace" component={ToolsMarketplace} />
                <Route exact path="/tools/:toolId" component={ToolDetails} />
                <Route exact path="/carbon-footprint" component={CarbonFootprintCalculator} />
                <Route exact path="/pest-detection" component={PestDetection} />
                <Route exact path="/workspace" component={IpadWorkspace} />
                <Route exact path="/maintenance-logs" component={MaintenanceLogs} />

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

                {/* SDG Knowledge Hub routes */}
                <Route exact path="/sdg-knowledge" component={LearnHome} />
                <Route exact path="/sdg-knowledge/organic-farming" component={OrganicFarming} />
                <Route exact path="/sdg-knowledge/modern-technology" component={ModernTechnology} />
                <Route exact path="/sdg-knowledge/eco-friendly" component={EcoFriendlyFarming} />
                <Route exact path="/crop-recommendation" component={CropRecommendation} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
