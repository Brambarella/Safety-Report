import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

/* ===== ROUTE GUARD ===== */
import PrivateRoute from './routes/PrivateRoute';

/* ===== PAGES ===== */
import Login from './pages/login';
import Dashboard from './pages/Dashboard';

/* ===== HSE ===== */
import InputLagging from './pages/hse/InputLagging';
import InputLeading from './pages/hse/InputLeading';
import InputTemuan from './pages/hse/InputTemuan';

/* ===== ADMIN ===== */
import Verifikasi from './pages/admin/Verifikasi';
import KelolaUser from './pages/admin/KelolaUser';

/* ===== MANAJEMEN ===== */
import Rekapitulasi from './pages/manajemen/Rekapitulasi';

function App() {
  return (
    <Router>
      <Routes>

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* DASHBOARD (SEMUA ROLE) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={['admin', 'hse', 'manajemen']}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* ================= HSE ================= */}
        <Route
          path="/hse/lagging"
          element={
            <PrivateRoute allowedRoles={['hse']}>
              <InputLagging />
            </PrivateRoute>
          }
        />

        <Route
          path="/hse/leading"
          element={
            <PrivateRoute allowedRoles={['hse']}>
              <InputLeading />
            </PrivateRoute>
          }
        />

        <Route
          path="/hse/temuan"
          element={
            <PrivateRoute allowedRoles={['hse']}>
              <InputTemuan />
            </PrivateRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/verifikasi"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <Verifikasi />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <KelolaUser />
            </PrivateRoute>
          }
        />

        {/* ================= MANAJEMEN ================= */}
        <Route
          path="/manajemen/rekap"
          element={
            <PrivateRoute allowedRoles={['manajemen']}>
              <Rekapitulasi />
            </PrivateRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;
