import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RTLWrapper } from '@/components/common/RTLWrapper';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Upload from '@/pages/Upload';
import SubmissionDetail from '@/pages/SubmissionDetail';
import ProjectDetail from '@/pages/ProjectDetail';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RTLWrapper>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submissions/:id"
              element={
                <ProtectedRoute>
                  <SubmissionDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            {/* Session 3 placeholders - reuse Dashboard until wired */}
            <Route
              path="/kpi"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RTLWrapper>
      </AuthProvider>
    </BrowserRouter>
  );
}
