import React from 'react';
import LegalDocumentPage from '../components/Legal/LegalDocumentPage';
import { TERMS_SECTIONS } from '../content/legal';
import SeoHead from '../components/SEO/SeoHead';
import { ROUTES } from '../config/seo';

const TermsOfService: React.FC = () => (
  <>
    <SeoHead title="Términos y Condiciones" path={ROUTES.terms} />
    <LegalDocumentPage
      title="Términos y Condiciones de Uso"
      intro="Reglas para usar Chéver: cuentas, pagos, publicaciones, torneos y eventos."
      sections={TERMS_SECTIONS}
    />
  </>
);

export default TermsOfService;
