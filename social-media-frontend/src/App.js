import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthContext from "./context/AuthContext";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from './components/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';
import SportsStats from './pages/SportsStats';
import AdminPanel from './pages/AdminPanel';
import SinglePostPage from './pages/SinglePostPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  return user ? <Navigate to="/home" /> : children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:username"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route path="/notifications" element={
            <PrivateRoute>
              <NotificationsPage />
            </PrivateRoute>
          } />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <SearchPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/sports-stats"
            element={
              <PrivateRoute>
                <SportsStats />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/post/:postId"
            element={
              <PrivateRoute>
                <SinglePostPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            }
            />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
