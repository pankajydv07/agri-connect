import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const Alert = ({ alerts }) => 
  alerts !== null && 
  alerts.length > 0 && 
  alerts.map(alert => (
    <div key={alert.id} className={`bg-${alert.alertType === 'danger' ? 'red' : 'green'}-100 border-l-4 border-${alert.alertType === 'danger' ? 'red' : 'green'}-500 text-${alert.alertType === 'danger' ? 'red' : 'green'}-700 p-4 mb-4`} role="alert">
      <p>{alert.msg}</p>
    </div>
  ));

Alert.propTypes = {
  alerts: PropTypes.array.isRequired
};

const mapStateToProps = state => ({
  alerts: state.alert
});

export default connect(mapStateToProps)(Alert);
