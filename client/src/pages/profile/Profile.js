import React, { useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateProfile, changePassword } from '../../actions/authActions';

const Profile = ({ auth: { user }, updateProfile, changePassword }) => {
  const [profileData, setProfileData] = useState({
    name: user ? user.name : '',
    email: user ? user.email : '',
    location: user ? user.location : '',
    phone: user ? user.phone : ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [activeTab, setActiveTab] = useState('profile');

  const { name, email, location, phone } = profileData;
  const { currentPassword, newPassword, confirmPassword } = passwordData;

  const onProfileChange = e => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const onPasswordChange = e => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const onProfileSubmit = e => {
    e.preventDefault();
    updateProfile(profileData);
  };

  const onPasswordSubmit = async e => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    
    const success = await changePassword({ 
      currentPassword, 
      newPassword 
    });
    
    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'profile' ? (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
          <form onSubmit={onProfileSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={onProfileChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={onProfileChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={location}
                onChange={onProfileChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={phone}
                onChange={onProfileChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <form onSubmit={onPasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={onPasswordChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={onPasswordChange}
                className="w-full px-3 py-2 border rounded-md"
                minLength="6"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onPasswordChange}
                className="w-full px-3 py-2 border rounded-md"
                minLength="6"
                required
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

Profile.propTypes = {
  auth: PropTypes.object.isRequired,
  updateProfile: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps, { updateProfile, changePassword })(Profile);
