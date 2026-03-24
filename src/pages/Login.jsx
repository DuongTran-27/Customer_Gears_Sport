import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
      loading: false,
      success: false,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = this.state;

    if (!email || !password) {
      this.setState({ error: 'Please fill in all fields' });
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      const res = await api.post('/login', { email, password });
      const { customer, token } = res.data;
      this.props.onLogin(customer._id, token);
      this.setState({ success: true, loading: false });
    } catch (err) {
      this.setState({
        error: err.response?.data?.message || 'Login failed. Please try again.',
        loading: false,
      });
    }
  };

  render() {
    const { email, password, error, loading, success } = this.state;

    if (success) {
      return <Navigate to="/" />;
    }

    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <svg viewBox="0 0 69 32" className="auth-logo">
                <path
                  d="M68.56 4L18.4 25.36Q12.16 28 7.92 28q-4.8 0-6.48-3.36-1.2-2.4.24-6.24t5.04-7.6l3.84 1.68Q4.32 19.92 4.32 22.8q0 3.6 5.28 1.2L66.8.56z"
                  fill="currentColor"
                />
              </svg>
              <h1>YOUR ACCOUNT FOR EVERYTHING GEARS</h1>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={this.handleChange}
                  className="form-input"
                  id="login-email"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={this.handleChange}
                  className="form-input"
                  id="login-password"
                />
              </div>
              <div className="form-options">
                <label className="form-checkbox">
                  <input type="checkbox" />
                  <span>Keep me signed in</span>
                </label>
                <a href="#" className="form-forgot">Forgot password?</a>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'SIGN IN'}
              </button>
            </form>

            <p className="auth-switch">
              Not a Member? <a href="/signup">Join Us</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
