import React from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../components/SEO/SeoHead';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
    <SeoHead title="Página no encontrada" path="/404" noindex />
    <div className="card-static max-w-lg w-full mx-auto text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">404</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
        No encontramos esta página. Prueba volver al inicio o iniciar sesión.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary inline-flex justify-center">
          Volver al inicio
        </Link>
        <Link
          to="/login"
          className="inline-flex justify-center rounded-2xl border border-gray-300 dark:border-gray-700 px-5 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100"
        >
          Iniciar sesión
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
