import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Quests from './pages/Quests';
import Habits from './pages/Habits';
import Agenda from './pages/Agenda';
import Projects from './pages/Projects';
import Notes from './pages/Notes';
import Training from './pages/Training';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Achievements from './pages/Achievements';
import Leaderboard from './pages/Leaderboard';
import Pomodoro from './pages/Pomodoro';
import Integrations from './pages/Integrations';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<Auth />} />
            <Route path="/auth/github/callback" element={<Auth />} />
            <Route
              path="/onboarding"
              element={
                <PrivateRoute>
                  <Onboarding />
                </PrivateRoute>
              }
            />
            
            {/* Protected routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/quests"
              element={
                <PrivateRoute>
                  <Layout>
                    <Quests />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/habits"
              element={
                <PrivateRoute>
                  <Layout>
                    <Habits />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <PrivateRoute>
                  <Layout>
                    <Agenda />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Layout>
                    <Projects />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <PrivateRoute>
                  <Layout>
                    <Notes />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/training"
              element={
                <PrivateRoute>
                  <Layout>
                    <Training />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <PrivateRoute>
                  <Layout>
                    <Achievements />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <PrivateRoute>
                  <Layout>
                    <Leaderboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/pomodoro"
              element={
                <PrivateRoute>
                  <Layout>
                    <Pomodoro />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/integrations"
              element={
                <PrivateRoute>
                  <Layout>
                    <Integrations />
                  </Layout>
                </PrivateRoute>
              }
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
