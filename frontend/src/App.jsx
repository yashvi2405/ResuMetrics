// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import { AuthProvider } from './context/AuthContext';
// import HomePage from './pages/HomePage';
// import DashboardPage from './pages/DashboardPage';
// import AnalysisPage from './pages/AnalysisPage';
// import './App.css';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <div className="app">
//           <Toaster 
//             position="top-right"
//             toastOptions={{
//               duration: 4000,
//               style: {
//                 background: '#363636',
//                 color: '#fff',
//                 borderRadius: '10px',
//               },
//               success: {
//                 duration: 3000,
//                 iconTheme: {
//                   primary: '#4ade80',
//                   secondary: '#fff',
//                 },
//               },
//               error: {
//                 duration: 4000,
//                 iconTheme: {
//                   primary: '#ef4444',
//                   secondary: '#fff',
//                 },
//               },
//             }}
//           />
//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             <Route path="/dashboard" element={<DashboardPage />} />
//             <Route path="/analysis/:resumeId" element={<AnalysisPage />} />
//             <Route path="*" element={<Navigate to="/" replace />} />
//           </Routes>
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext'; // ← added useAuth here
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AnalysisPage from './pages/AnalysisPage';
import AssistantPage from './pages/AssistantPage';
import SchedulePage from './pages/SchedulePage';
import ResumesPage from './pages/ResumesPage';
import SettingsPage from './pages/SettingsPage';
import PrepPage from './pages/PrepPage';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#111009',
      color: '#D97706',
      fontSize: '1rem',
      fontWeight: 600,
      fontFamily: 'Inter, sans-serif',
      letterSpacing: '0.5px'
    }}>
      Loading...
    </div>
  );
  
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  React.useEffect(() => {
    // Remove any leftover theme attribute
    document.documentElement.removeAttribute('data-theme');
    document.body.removeAttribute('data-theme');
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1C1814',
                color: '#F0E6D3',
                borderRadius: '10px',
                border: '1px solid #2A231A',
                fontSize: '0.875rem',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#D97706',
                  secondary: '#1C1814',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#B45454',
                  secondary: '#1C1814',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/resumes" element={
              <ProtectedRoute>
                <ResumesPage />
              </ProtectedRoute>
            } />
            <Route path="/prep" element={
              <ProtectedRoute>
                <PrepPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/analysis/:resumeId" element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            } />
            <Route path="/chats" element={
              <ProtectedRoute>
                <AssistantPage />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <SchedulePage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;