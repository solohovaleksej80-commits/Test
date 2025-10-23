import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from './store';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Farm } from './pages/Farm';
import { Shop } from './pages/Shop';
import { Quests } from './pages/Quests';
import { Profile } from './pages/Profile';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useGameStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      {children}
      <BottomNav />
    </>
  );
};

// Public Route Component (for login/register)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated } = useGameStore();

  if (isAuthenticated) {
    return <Navigate to="/farm" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
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

        {/* Protected routes */}
        <Route
          path="/farm"
          element={
            <ProtectedRoute>
              <Farm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quests"
          element={
            <ProtectedRoute>
              <Quests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/farm" replace />} />
        <Route path="*" element={<Navigate to="/farm" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
