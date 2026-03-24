import React, { Component } from 'react';
import api from '../utils/api';

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: '',
      token: '',
      error: '',
      success: '',
      loading: false,
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '' });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    const { _id, token } = this.state;

    if (!_id || !token) {
      this.setState({ error: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    this.setState({ loading: true, error: '' });

    try {
      // Try POST first, then GET as fallback
      try {
        await api.post('/active', { id: _id, token });
      } catch (postErr) {
        // If POST fails, try as GET with query params
        if (postErr.response?.status === 404 || postErr.response?.status === 405) {
          await api.get(`/active?id=${_id}&token=${token}`);
        } else {
          throw postErr;
        }
      }
      this.setState({
        success: 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.',
        loading: false,
        error: '',
      });
    } catch (err) {
      console.error('Activation error:', err);
      this.setState({
        error: err.response?.data?.message || err.response?.data?.msg || 'Kích hoạt thất bại. Vui lòng thử lại.',
        loading: false,
      });
    }
  };

  render() {
    const { _id, token, error, success, loading } = this.state;

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
              <h1>KÍCH HOẠT TÀI KHOẢN</h1>
              <p>Nhập thông tin kích hoạt đã được gửi đến email của bạn để xác minh tài khoản.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <form className="auth-form" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="_id"
                  placeholder="ID của bạn"
                  value={_id}
                  onChange={this.handleChange}
                  className="form-input"
                  id="active-id"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="token"
                  placeholder="Mã kích hoạt (Token)"
                  value={token}
                  onChange={this.handleChange}
                  className="form-input"
                  id="active-token"
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? 'Đang kích hoạt...' : 'KÍCH HOẠT'}
              </button>
            </form>

            <p className="auth-switch">
              Đã kích hoạt? <a href="/login">Đăng nhập</a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Active;
