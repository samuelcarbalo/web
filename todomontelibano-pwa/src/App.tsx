import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout
import MainLayout from './components/Layout/MainLayout';
import ScrollToTop from './components/UI/ScrollToTop';
// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import JobsList from './pages/Jobs/JobsList';
import JobDetail from './pages/Jobs/JobDetail';
import CreateJob from './pages/Jobs/CreateJob';
import EditJob from './pages/Jobs/EditJob';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyApplications from './pages/Applications/MyApplications';
import ReceivedApplications from './pages/Applications/ReceivedApplications';
import MyOffers from './pages/Jobs/MyOffers';
import TournamentsList from './pages/Sports/TournamentsList';
import TournamentDetail from './pages/Sports/TournamentDetail';
import CreateTournament from './pages/Sports/CreateTournament';
import EditTournament from './pages/Sports/EditTournament';
import TeamRosterPage from './pages/Sports/TeamRosterPage';
import TeamDetailPage from './pages/Sports/TeamDetailPage';
import PlayerProfilePage from './pages/Sports/PlayerProfilePage';
import TournamentSchedulePage from './pages/Sports/TournamentSchedulePage';
import SportsPublicPage from './pages/Sports/SportsPublicPage';
import TournamentPublicPage from './pages/Sports/TournamentPublicPage';
import MatchDetailPage from './pages/Sports/MatchDetailPage';

// Hooks & Store
// import { useMe } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente de carga simple
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);

// AuthChecker NO bloqueante - solo actualiza el store en background
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setLoading = useAuthStore((state) => state.setLoading);
  
  // TEMPORAL: Deshabilitar verificación de auth al cargar
  useEffect(() => {
    setLoading(false);
  }, [setLoading]);

  // No llamar useMe() por ahora
  // const { isLoading } = useMe();
  
  return <>{children}</>;
};

// Wrapper para rutas protegidas (estas sí esperan auth)
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  
  // Mientras verifica auth, muestra loader
  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <AuthInitializer>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Rutas públicas - NO requieren auth */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="jobs" element={<JobsList />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="jobs/my_offers" element={<MyOffers />} />
                <Route path="sports" element={<TournamentsList />} />
                <Route path="sports/my_tournaments" element={<TournamentsList />} />
                <Route path="sports/my_tournaments/active" element={<TournamentsList />} />
                <Route path="sports/tournaments/:slug" element={<TournamentDetail />} />
                <Route path="sports/tournaments/create" element={<CreateTournament />} />
                <Route path="sports/tournaments/:slug/edit" element={<EditTournament />} />
                <Route path="/sports/tournaments/:tournamentSlug/teams/:teamSlug" element={<TeamDetailPage />} />
                <Route path="/sports/tournaments/:tournamentSlug/teams/:teamSlug/roster" element={<TeamRosterPage />} />
                <Route path="/sports/players/:playerId" element={<PlayerProfilePage />} />
                <Route path="/sports/tournaments/:slug/schedule" element={<TournamentSchedulePage />} />
                <Route path="/sports/matches/:id" element={<MatchDetailPage />} />
                {/* Servicios futuros */}
                <Route path="events" element={<div className="p-20 text-center text-2xl">Eventos - Próximamente 🎉</div>} />
                <Route path="real-estate" element={<div className="p-20 text-center text-2xl">Bienes Raíces - Próximamente 🏠</div>} />
                
                {/* Rutas protegidas - SÍ requieren auth */}
                <Route 
                  path="jobs/create" 
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <CreateJob />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="jobs/edit/:id" 
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <EditJob />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                {/* ✅ NUEVA RUTA - Mis Aplicaciones (protegida) */}
                  <Route 
                    path="applications" 
                    element={
                      <ProtectedRoute>
                        <MyApplications />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="applications/received" 
                    element={
                      <ProtectedRoute allowedRoles={['manager', 'admin']}>
                        <ReceivedApplications />
                      </ProtectedRoute>
                    } 
                  />
              </Route>

              {/* Auth routes - públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* 404 */}
              <Route path="*" element={<div className="p-20 text-center text-2xl">404 - Página no encontrada 🔍</div>} />
            </Routes>
          </Suspense>
        </AuthInitializer>
      </Router>
    </QueryClientProvider>
  );
};

export default App;