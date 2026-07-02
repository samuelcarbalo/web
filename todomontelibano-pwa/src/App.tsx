import React, { Suspense, useEffect, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout
import MainLayout from './components/Layout/MainLayout';
import ScrollToTop from './components/UI/ScrollToTop';
// Pages (Core estáticas)
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';

// Pages (Carga Perezosa / Lazy Loading)
const JobsList = lazy(() => import('./pages/Jobs/JobsList'));
const JobDetail = lazy(() => import('./pages/Jobs/JobDetail'));
const CreateJob = lazy(() => import('./pages/Jobs/CreateJob'));
const EditJob = lazy(() => import('./pages/Jobs/EditJob'));
const Profile = lazy(() => import('./pages/Profile'));
const MyApplications = lazy(() => import('./pages/Applications/MyApplications'));
const ReceivedApplications = lazy(() => import('./pages/Applications/ReceivedApplications'));
const MyOffers = lazy(() => import('./pages/Jobs/MyOffers'));
const TournamentsList = lazy(() => import('./pages/Sports/TournamentsList'));
const TournamentDetail = lazy(() => import('./pages/Sports/TournamentDetail'));
const CreateTournament = lazy(() => import('./pages/Sports/CreateTournament'));
const EditTournament = lazy(() => import('./pages/Sports/EditTournament'));
const TeamRosterPage = lazy(() => import('./pages/Sports/TeamRosterPage'));
const TeamDetailPage = lazy(() => import('./pages/Sports/TeamDetailPage'));
const PlayerProfilePage = lazy(() => import('./pages/Sports/PlayerProfilePage'));
const TournamentSchedulePage = lazy(() => import('./pages/Sports/TournamentSchedulePage'));
const MatchDetailPage = lazy(() => import('./pages/Sports/MatchDetailPage'));
const TournamentStandingsPage = lazy(() => import('./pages/Sports/TournamentStandingsPage'));
const TournamentStructurePage = lazy(() => import('./pages/Sports/TournamentStructurePage'));
const PlayerStatsPage = lazy(() => import('./pages/Sports/PlayerStatsPage'));
const TournamentPlayerStatsPage = lazy(() => import('./pages/Sports/TournamentPlayerStatsPage'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ContactMessagesPage = lazy(() => import('./pages/ContactMessagesPage'));
const MessagesPage = lazy(() => import('./pages/Messages/MessagesPage'));
const ListingsList = lazy(() => import('./pages/RealEstate/ListingsList'));
const ListingDetail = lazy(() => import('./pages/RealEstate/ListingDetail'));
const CreateListing = lazy(() => import('./pages/RealEstate/CreateListing'));
const EditListing = lazy(() => import('./pages/RealEstate/EditListing'));
const MyListings = lazy(() => import('./pages/RealEstate/MyListings'));
const CreditPackagesPage = lazy(() => import('./pages/Credits/CreditPackagesPage'));
const PaymentResultPage = lazy(() => import('./pages/Credits/PaymentResultPage'));
const EventsList = lazy(() => import('./pages/Events/EventsList'));
const EventDetail = lazy(() => import('./pages/Events/EventDetail'));
const CreateEvent = lazy(() => import('./pages/Events/CreateEvent'));
const MyEvents = lazy(() => import('./pages/Events/MyEvents'));

// Hooks & Store
import { useMe } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import {
  JobsLegacyRedirect,
  SportsLegacyRedirect,
  RealEstateLegacyRedirect,
} from './routes/legacyRedirects';

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
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
  </div>
);

// AuthChecker NO bloqueante - solo actualiza el store en background
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setLoading = useAuthStore((state) => state.setLoading);
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    // Si no hay token de sesión, apagar la pantalla de carga inicial inmediatamente.
    // Si hay token, useMe() manejará el cambio de estado de carga al finalizar la consulta.
    if (!token) {
      setLoading(false);
    }
  }, [setLoading]);

  // Llama useMe para mantener el store sincronizado con el backend en segundo plano
  useMe();
  
  return <>{children}</>;
};

// Wrapper para rutas protegidas (estas sí esperan auth)
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
  requireSuperuser?: boolean;
}> = ({
  children,
  allowedRoles,
  requireSuperuser,
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  
  // Mientras verifica auth, muestra loader
  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperuser && !user?.is_superuser) {
    return <Navigate to="/dashboard" replace />;
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
                <Route path="privacy" element={<PrivacyPolicy />} />
                <Route path="terms" element={<TermsOfService />} />
                <Route path="contact" element={<ContactPage />} />

                {/* Rutas SEO canónicas (español) */}
                <Route path="empleos" element={<JobsList />} />
                <Route path="empleos/:id" element={<JobDetail />} />
                <Route path="empleos/mis-ofertas" element={<MyOffers />} />
                <Route
                  path="empleos/publicar"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <CreateJob />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="empleos/editar/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <EditJob />
                    </ProtectedRoute>
                  }
                />

                <Route path="deportes" element={<TournamentsList />} />
                <Route path="deportes/my_tournaments" element={<TournamentsList />} />
                <Route path="deportes/my_tournaments/active" element={<TournamentsList />} />
                <Route path="deportes/tournaments/:slug" element={<TournamentDetail />} />
                <Route path="deportes/tournaments/create" element={<CreateTournament />} />
                <Route path="deportes/tournaments/:slug/edit" element={<EditTournament />} />
                <Route path="deportes/tournaments/:tournamentSlug/teams/:teamSlug" element={<TeamDetailPage />} />
                <Route path="deportes/tournaments/:tournamentSlug/teams/:teamSlug/roster" element={<TeamRosterPage />} />
                <Route path="deportes/players/:playerId" element={<PlayerProfilePage />} />
                <Route path="deportes/tournaments/:slug/schedule" element={<TournamentSchedulePage />} />
                <Route path="deportes/matches/:id" element={<MatchDetailPage />} />
                <Route path="deportes/tournaments/:slug/standings" element={<TournamentStandingsPage />} />
                <Route path="deportes/tournaments/:slug/structure" element={<TournamentStructurePage />} />
                <Route path="deportes/players/:id/stats" element={<PlayerStatsPage />} />
                <Route path="deportes/tournaments/:slug/player-stats" element={<TournamentPlayerStatsPage />} />

                <Route path="bienes-raices" element={<ListingsList />} />
                <Route path="bienes-raices/mis-publicaciones" element={<MyListings />} />
                <Route path="bienes-raices/:id" element={<ListingDetail />} />
                <Route
                  path="bienes-raices/publicar"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <CreateListing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="bienes-raices/editar/:id"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <EditListing />
                    </ProtectedRoute>
                  }
                />

                {/* Redirecciones legacy (inglés → español) */}
                <Route path="jobs" element={<Navigate to="/empleos" replace />} />
                <Route path="jobs/*" element={<JobsLegacyRedirect />} />
                <Route path="sports" element={<Navigate to="/deportes" replace />} />
                <Route path="sports/*" element={<SportsLegacyRedirect />} />
                <Route path="real-estate" element={<Navigate to="/bienes-raices" replace />} />
                <Route path="real-estate/*" element={<RealEstateLegacyRedirect />} />
                <Route path="trabajos" element={<Navigate to="/empleos" replace />} />
                <Route path="trabajos/*" element={<Navigate to="/empleos" replace />} />
                <Route path="propiedades" element={<Navigate to="/bienes-raices" replace />} />
                <Route path="propiedades/*" element={<Navigate to="/bienes-raices" replace />} />

                <Route path="eventos" element={<EventsList />} />
                <Route path="eventos/:slug" element={<EventDetail />} />
                <Route path="eventos/mis-eventos" element={
                  <ProtectedRoute allowedRoles={['manager', 'admin']}>
                    <MyEvents />
                  </ProtectedRoute>
                } />
                <Route
                  path="eventos/publicar"
                  element={
                    <ProtectedRoute allowedRoles={['manager', 'admin']}>
                      <CreateEvent />
                    </ProtectedRoute>
                  }
                />
                <Route path="events" element={<Navigate to="/eventos" replace />} />
                <Route path="events/*" element={<Navigate to="/eventos" replace />} />

                <Route path="creditos" element={<CreditPackagesPage />} />
                <Route path="creditos/resultado" element={<PaymentResultPage />} />
                
                {/* Rutas protegidas adicionales */}
                <Route 
                  path="dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="dashboard/contacto" 
                  element={
                    <ProtectedRoute requireSuperuser>
                      <ContactMessagesPage />
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
                  <Route 
                    path="messages" 
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="messages/:conversationId" 
                    element={
                      <ProtectedRoute>
                        <MessagesPage />
                      </ProtectedRoute>
                    } 
                  />
              </Route>

              {/* Auth routes - públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* 404 */}
              <Route path="*" element={<div className="page-container page-section text-center"><div className="card-static max-w-lg mx-auto"><h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">404</h2><p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Página no encontrada 🔍</p></div></div>} />
            </Routes>
          </Suspense>
        </AuthInitializer>
      </Router>
    </QueryClientProvider>
  );
};

export default App;