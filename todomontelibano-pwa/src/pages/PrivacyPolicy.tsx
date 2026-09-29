import React from 'react';
import LegalDocumentPage from '../components/Legal/LegalDocumentPage';
import { PRIVACY_SECTIONS } from '../content/legal';
import SeoHead from '../components/SEO/SeoHead';
import { ROUTES } from '../config/seo';

const PrivacyPolicy: React.FC = () => (
  <>
    <SeoHead title="Política de Privacidad" path={ROUTES.privacy} />
    <LegalDocumentPage
      title="Política de Privacidad"
      intro="Cómo Chéver trata tus datos personales y los datos de contacto en empleos, inmuebles y deportes."
      sections={PRIVACY_SECTIONS}
    />
  </>
);

export default PrivacyPolicy;
