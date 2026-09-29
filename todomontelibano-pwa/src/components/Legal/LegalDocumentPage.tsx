import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { TERMS_UPDATED_LABEL, type LegalSection } from '../../content/legal';

interface Props {
  title: string;
  intro: string;
  sections: LegalSection[];
}

const LegalDocumentPage: React.FC<Props> = ({ title, intro, sections }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950/50 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-green-600 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al inicio
      </Link>
      <header className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-8 md:p-12 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-gray-500 text-lg mt-2">{intro}</p>
        <p className="text-xs text-gray-400 mt-4">Última actualización: {TERMS_UPDATED_LABEL}</p>
      </header>
      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{section.title}</h2>
            <div className="text-gray-600 dark:text-gray-400 space-y-3 leading-relaxed">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc list-inside space-y-2 pl-2">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  </div>
);

export default LegalDocumentPage;
