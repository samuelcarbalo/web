import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SEO/SeoHead';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <SeoHead title="Página no encontrada" path="/404" noindex />
    <div className="card-static max-w-lg w-full mx-auto text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
        Página no encontrada. Si pegaste una URL directa y ves este mensaje de forma intermitente,
        el hosting debe redirigir todas las rutas a <code className="text-xs">index.html</code>.
      </p>
      <Link to="/" className="btn-primary inline-flex mt-8">
        Volver al inicio
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
