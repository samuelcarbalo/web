import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Calendar, 
  Home, 
  User, 
  Menu, 
  X, 
  LogOut,
  Building2,
  Trophy,
  House,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useLogout } from '../../hooks/useAuth';

const MainLayout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isServicesOpen, setIsServicesOpen] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();

  const services = [
    { 
      name: 'Empleos', 
      icon: Briefcase, 
      path: '/jobs', 
      active: true,
      description: 'Encuentra tu próximo trabajo'
    },
    { 
      name: 'Eventos', 
      icon: Calendar, 
      path: '/events', 
      active: false,
      description: 'Próximamente',
      comingSoon: true
    },
    { 
      name: 'Deportes', 
      icon: Trophy, 
      path: '/sports', 
      active: false,
      description: 'Fútbol, Softbol y más',
      comingSoon: true
    },
    { 
      name: 'Bienes Raíces', 
      icon: House, 
      path: '/real-estate', 
      active: false,
      description: 'Propiedades en venta y alquiler',
      comingSoon: true
    },
  ];

  const navItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Servicios', path: '#services', icon: Building2, hasDropdown: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 pwa-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">TodoMontelibano</h1>
                <p className="text-xs text-gray-500">Tu plataforma todo en uno</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-sm font-medium ${isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'}`}
              >
                Inicio
              </Link>
              
              {/* Services Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
                >
                  Servicios
                  <svg className={`ml-1 w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isServicesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {services.map((service) => (
                      <Link
                        key={service.name}
                        to={service.active ? service.path : '#'}
                        onClick={(e) => {
                          if (!service.active) e.preventDefault();
                          setIsServicesOpen(false);
                        }}
                        className={`flex items-start px-4 py-3 hover:bg-gray-50 ${!service.active ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className={`p-2 rounded-lg ${service.active ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                          <service.icon className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            {service.name}
                            {service.comingSoon && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                Pronto
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{service.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Bell className="w-5 h-5" />
                  </button>
                  <div className="relative group">
                    <button className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{user?.first_name}</span>
                    </button>
                    
                    {/* Contenedor invisible que detecta el hover */}
                    <div className="absolute right-0 top-full w-48 pt-2 hidden group-hover:block">
                      
                      {/* El menú visual (ahora sin mt-2 porque el padding del padre da el espacio) */}
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Mi Perfil
                        </Link>
                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          Dashboard
                        </Link>
                        {user?.role === 'manager' && (
                          <Link to="/jobs/manage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            Gestionar Empleos
                          </Link>
                        )}
                        <hr className="my-2" />
                        <button 
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    Registrarse
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              <Link to="/" className="block py-2 text-base font-medium text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Inicio
              </Link>
              
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Servicios</p>
                {services.map((service) => (
                  <Link
                    key={service.name}
                    to={service.active ? service.path : '#'}
                    onClick={(e) => {
                      if (!service.active) e.preventDefault();
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center py-2 ${service.active ? 'text-gray-700' : 'text-gray-400'}`}
                  >
                    <service.icon className="w-5 h-5 mr-3" />
                    {service.name}
                    {service.comingSoon && (
                      <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        Pronto
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {isAuthenticated ? (
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <Link to="/profile" className="block py-2 text-base font-medium text-gray-700">
                    Mi Perfil
                  </Link>
                  <Link to="/dashboard" className="block py-2 text-base font-medium text-gray-700">
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left py-2 text-base font-medium text-red-600"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <Link to="/login" className="block py-2 text-base font-medium text-primary-600">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="block py-2 text-base font-medium text-primary-600">
                    Crear Cuenta
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">T</span>
                </div>
                <span className="text-lg font-bold text-gray-900">TodoMontelibano</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                La plataforma integral para Montelibano. Encuentra empleos, eventos, deportes y bienes raíces en un solo lugar.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/jobs" className="hover:text-primary-600">Empleos</Link></li>
                <li><span className="text-gray-400">Eventos (Pronto)</span></li>
                <li><span className="text-gray-400">Deportes (Pronto)</span></li>
                <li><span className="text-gray-400">Bienes Raíces (Pronto)</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/privacy" className="hover:text-primary-600">Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-primary-600">Términos</Link></li>
                <li><Link to="/contact" className="hover:text-primary-600">Contacto</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2024 TodoMontelibano. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;