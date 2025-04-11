import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { deleteUser } from '../../actions/adminActions';

const UserList = ({ users, deleteUser }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Location</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td className="border px-4 py-2">{user.name}</td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.role}</td>
              <td className="border px-4 py-2">{user.location}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => deleteUser(user._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.array.isRequired,
  deleteUser: PropTypes.func.isRequired
};

export default connect(null, { deleteUser })(UserList);
