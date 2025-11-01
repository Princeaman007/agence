import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmailNotice from './pages/VerifyEmailNotice';
import VerifyEmail from './pages/Verifyemail';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import Profile from './components/dashboard/Profile';
import EditProfile from './pages/Editprofile';
import Search from './pages/Search';
import Messages from './pages/Messages';
import CompatibilityTest from './pages/CompatibilityTest';
import CompatibilityResults from './pages/CompatibilityResults';
import Matches from './pages/Matches';

// Composant pour protéger les routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Composant pour les routes publiques (rediriger si connecté)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Route publique - Page d'accueil */}
          <Route path="/" element={<Home />} />

          {/* Routes publiques */}
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

          {/* Route de vérification email (publique) */}
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Routes protégées */}
          <Route
            path="/verify-email-notice"
            element={
              <PrivateRoute>
                <VerifyEmailNotice />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <PrivateRoute>
                <Pricing />
              </PrivateRoute>
            }
          />

          {/* Routes Phase 2 */}
          <Route
            path="/profile/:id"
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
            path="/search"
            element={
              <PrivateRoute>
                <Search />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />

          {/* Routes Phase 4 - Compatibilité */}
          <Route
            path="/compatibility-test"
            element={
              <PrivateRoute>
                <CompatibilityTest />
              </PrivateRoute>
            }
          />
          <Route
            path="/compatibility-results"
            element={
              <PrivateRoute>
                <CompatibilityResults />
              </PrivateRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <PrivateRoute>
                <Matches />
              </PrivateRoute>
            }
          />

          {/* Page 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                  <a href="/" className="btn-primary">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;