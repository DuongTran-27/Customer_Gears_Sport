import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
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
    const { full_name, email, phone, password, confirmPassword } = this.state;

    if (!full_name || !email || !phone || !password) {
      this.setState({ error: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      this.setState({ error: 'Passwords do not match' });
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      await api.post('/signup', { full_name, email, phone, password });
      this.setState({ success: true, loading: false });
      if (this.props.onSignupSuccess) {
        this.props.onSignupSuccess();
      }
    } catch (err) {
      this.setState({
        error: err.response?.data?.message || 'Signup failed. Please try again.',
        loading: false,
      });
    }
  };

  render() {
    const { full_name, email, phone, password, confirmPassword, error, loading, success } = this.state;

    if (success) {
      return <Navigate to="/active" />;
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
              <h1>BECOME A MEMBER</h1>
              <p>Create your Gears Sport Member profile and get access to exclusive products and events.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  value={full_name}
                  onChange={this.handleChange}
                  className="form-input"
                  id="signup-fullname"
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={this.handleChange}
                  className="form-input"
                  id="signup-email"
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={this.handleChange}
                  className="form-input"
                  id="signup-phone"
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
                  id="signup-password"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={this.handleChange}
                  className="form-input"
                  id="signup-confirm-password"
                />
              </div>
              <p className="auth-terms">
                By creating an account, you agree to Gears Sport's{' '}
                <a href="#">Privacy Policy</a> and <a href="#">Terms of Use</a>.
              </p>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'JOIN US'}
              </button>
            </form>

            <p className="auth-switch">
              Already a Member? <a href="/login">Sign In</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Signup;
