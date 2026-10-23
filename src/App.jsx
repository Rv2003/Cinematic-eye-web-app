import { Routes, Route } from 'react-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider } from '@react-oauth/google';

import './App.css';
import { Homepage } from './webpages/homepage';
import { About } from './webpages/about';
import { Login } from './webpages/loginpage';
import { Booking } from './webpages/booking';
import { Profile } from './webpages/profile';
import { ProtectedRoutes } from './utils/protectedroutes';

// Admin Panel
import { AdminProtectedRoutes } from './admin/AdminProtectedRoutes';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/pages/AdminDashboard';
import { AdminBookings } from './admin/pages/AdminBookings';
import { AdminGallery } from './admin/pages/AdminGallery';
import { AdminTeam } from './admin/pages/AdminTeam';
import { AdminSettings } from './admin/pages/AdminSettings';

const CLIENT_ID = "806438665621-ot0fnvqdvp6irvj2nfme3ue53d8ic77o.apps.googleusercontent.com";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await axios.post(
          'http://localhost:5500/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        setToken(response.data.data.token);
        setUser(response.data.data.user);
      } catch (error) {
        // No valid refresh cookie — genuinely logged out
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Homepage
              user={user}
              setUser={setUser}
              token={token}
              setToken={setToken}
              setAuthLoading={setAuthLoading}
              authLoading={authLoading}
            />
          }
        />
        <Route
          path="/about"
          element={
            <About
              user={user}
              setUser={setUser}
              token={token}
              setToken={setToken}
              authLoading={authLoading}
              setAuthLoading={setAuthLoading}
            />
          }
        />
        <Route
          path="/login"
          element={
            <Login
              user={user}
              setUser={setUser}
              token={token}
              setToken={setToken}
            />
          }
        />
        <Route
          path="/booking"
          element={
            <Booking
              user={user}
              setUser={setUser}
              token={token}
              setToken={setToken}
              setAuthloading={setAuthLoading}
              authLoading={authLoading}
            />
          }
        />

        {/* User Protected Routes */}
        <Route element={<ProtectedRoutes user={user} authLoading={authLoading} />}>
          <Route
            path="/profile"
            element={
              <Profile
                token={token}
                setAuthloading={setAuthLoading}
                authLoading={authLoading}
                setUser={setUser}
                setToken={setToken}
              />
            }
          />
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<AdminProtectedRoutes user={user} authLoading={authLoading} />}>
          <Route
            path="/admin"
            element={<AdminLayout setUser={setUser} setToken={setToken} />}
          >
            <Route index element={<AdminDashboard token={token} />} />
            <Route path="bookings" element={<AdminBookings token={token} />} />
            <Route path="gallery" element={<AdminGallery token={token} />} />
            <Route path="team" element={<AdminTeam />} />
            <Route
              path="settings"
              element={
                <AdminSettings
                  token={token}
                  setUser={setUser}
                  setToken={setToken}
                />
              }
            />
          </Route>
        </Route>
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
