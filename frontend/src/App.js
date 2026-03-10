import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { AuthCallback } from './components/AuthCallback';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { Create } from './pages/Create';
import { Results } from './pages/Results';
import { Dashboard } from './pages/Dashboard';
import { Toaster } from './components/ui/sonner';
import './App.css';

// Router wrapper to handle auth callback
function AppRouter() {
  const location = useLocation();
  
  // Check URL fragment for session_id (OAuth callback)
  // This must be synchronous - NOT in useEffect - to prevent race conditions
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <Create />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/results/:weddingId" 
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        {/* Fallback to landing */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster 
          position="top-center" 
          richColors 
          toastOptions={{
            style: {
              background: '#171717',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#f8fafc',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
