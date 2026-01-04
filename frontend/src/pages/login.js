import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, Moon, Sun, Activity } from 'lucide-react';
import ContactAdminModal from '../components/ContactAdminModal';
import '../styles/login.css';

function Login() {
  /* =========================
     STATE
  ========================= */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showContact, setShowContact] = useState(false);

  /* =========================
     THEME
  ========================= */
  const [theme, setTheme] = useState('light');

useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);


  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  /* =========================
     LOGIN HANDLER
  ========================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5001/api/login', {
        username: email,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Email atau password salah');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* ===== HEADER ===== */}
            <div className="login-header">
      <div className="logo-center">
        <Activity size={26} />
        <span>Sistem <b>Safety Report</b></span>
      </div>

      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>

        {/* ===== WELCOME ===== */}
        <h2>Selamat Datang</h2>
        <p className="subtitle">Masuk untuk melanjutkan.</p>

        {/* ===== ERROR ===== */}
        {error && <div className="error-text">{error}</div>}

        {/* ===== FORM ===== */}
        <form onSubmit={handleLogin}>

          {/* EMAIL */}
          <label>Alamat Email</label>
          <div className="input-group">
            <Mail size={18} />
            <input
              type="text"
              placeholder="anda@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="password-row">
            <label>Password</label>
          </div>

          <div className="input-group">
            <Lock size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* BUTTON */}
          <button className="btn-login">
            Masuk ke Dasbor
          </button>
        </form>

        {/* ===== FOOTER ===== */}
        <div className="login-footer">
          Tidak punya akun?{' '}
          <span onClick={() => setShowContact(true)}>
            Hubungi Admin
          </span>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {showContact && (
        <ContactAdminModal onClose={() => setShowContact(false)} />
      )}

      <div className="login-copyright">
        © 2025 Sistem Safety Report. All rights reserved.
      </div>
    </div>
  );
}

export default Login;
