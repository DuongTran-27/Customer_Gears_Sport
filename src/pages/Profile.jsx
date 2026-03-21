import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../utils/api';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      editMode: false,
      full_name: '',
      email: '',
      phone: '',
      error: '',
      success: '',
      loading: true,
      saving: false,
      loggedOut: false,
    };
  }

  componentDidMount() {
    this.fetchProfile();
  }

  fetchProfile = async () => {
    const userId = this.props.userId || localStorage.getItem('_id');
    if (!userId) {
      this.setState({ error: 'Không tìm thấy ID người dùng', loading: false });
      return;
    }
    try {
      const res = await api.get(`/user/${userId}`);
      // Handle both direct object and nested data response
      const user = res.data.user || res.data;
      this.setState({
        user,
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        loading: false,
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      this.setState({
        error: err.response?.data?.message || 'Không thể tải hồ sơ',
        loading: false,
      });
    }
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value, error: '', success: '' });
  };

  handleEdit = () => {
    this.setState({ editMode: true, success: '' });
  };

  handleCancel = () => {
    const { user } = this.state;
    this.setState({
      editMode: false,
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      error: '',
    });
  };

  handleSave = async (e) => {
    e.preventDefault();
    const { full_name, email, phone } = this.state;
    const userId = this.props.userId || localStorage.getItem('_id');

    this.setState({ saving: true, error: '' });

    try {
      const res = await api.put(`/user/${userId}`, {
        full_name,
        email,
        phone,
      });
      const user = res.data.user || res.data;
      this.setState({
        user,
        editMode: false,
        saving: false,
        success: 'Cập nhật hồ sơ thành công!',
      });
    } catch (err) {
      this.setState({
        error: err.response?.data?.message || 'Cập nhật thất bại',
        saving: false,
      });
    }
  };

  handleLogout = () => {
    this.props.onLogout();
    this.setState({ loggedOut: true });
  };

  render() {
    const {
      user, editMode, full_name, email, phone,
      error, success, loading, saving, loggedOut,
    } = this.state;

    if (loggedOut) {
      return <Navigate to="/" />;
    }

    if (loading) {
      return (
        <div className="page-container">
          <div className="loading-spinner"><div className="spinner"></div></div>
        </div>
      );
    }

    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h2 className="profile-name">{user?.full_name || 'Thành viên'}</h2>
            <p className="profile-member">Thành viên Gears Sport</p>
            <button className="btn btn-danger btn-full" onClick={this.handleLogout}>
              Đăng xuất
            </button>
          </div>

          <div className="profile-main">
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>Thông tin hồ sơ</h2>
                {!editMode && (
                  <button className="btn btn-outline btn-small" onClick={this.handleEdit}>
                    Sửa
                  </button>
                )}
              </div>

              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}

              {editMode ? (
                <form className="auth-form" onSubmit={this.handleSave}>
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input
                      type="text"
                      name="full_name"
                      value={full_name}
                      onChange={this.handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={this.handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={this.handleChange}
                      className="form-input"
                    />
                  </div>
                  <div className="profile-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={this.handleCancel}
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info">
                  <div className="profile-info-row">
                    <span className="profile-info-label">Họ và tên</span>
                    <span className="profile-info-value">{user?.full_name}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Email</span>
                    <span className="profile-info-value">{user?.email}</span>
                  </div>
                  <div className="profile-info-row">
                    <span className="profile-info-label">Số điện thoại</span>
                    <span className="profile-info-value">{user?.phone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;
