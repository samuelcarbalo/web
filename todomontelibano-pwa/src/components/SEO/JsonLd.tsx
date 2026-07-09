import React from 'react';
import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

const JsonLd: React.FC<JsonLdProps> = ({ data }) => (
  <Helmet>
    <script type="application/ld+json">{JSON.stringify(data)}</script>
  </Helmet>
);

export default JsonLd;
