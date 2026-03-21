import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';

class ProtectedRoute extends Component {
  render() {
    const { isLoggedIn, children } = this.props;

    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }

    return children;
  }
}

export default ProtectedRoute;
