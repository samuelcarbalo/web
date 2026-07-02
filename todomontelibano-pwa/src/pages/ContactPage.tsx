import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Send, User, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSendContactMessage } from '../hooks/useContact';

const ContactPage: React.FC = () => {
  const { user } = useAuthStore();
  const sendMutation = useSendContactMessage();

  const [form, setForm] = useState({
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMutation.mutate(form, {
      onSuccess: () => {
        setSent(true);
        setForm((prev) => ({ ...prev, subject: '', message: '' }));
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950/50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <div className="card-static mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-violet-500/5 rounded-full -mr-8 -mt-8" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="p-4 bg-violet-50 dark:bg-violet-950/40 rounded-3xl shrink-0">
              <Mail className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Contacto</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Escríbenos con dudas, sugerencias o reportes. Revisamos cada mensaje y te respondemos
                lo antes posible.
              </p>
            </div>
          </div>
        </div>

        {sent && (
          <div className="mb-6 rounded-3xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/30 p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">Mensaje enviado</p>
              <p className="text-sm text-green-700 dark:text-green-400/90 mt-1">
                Gracias por contactarnos. Hemos recibido tu mensaje correctamente.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-static space-y-5">
          <div>
            <label htmlFor="contact-name" className="auth-label flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre
            </label>
            <input
              id="contact-name"
              type="text"
              required
              minLength={2}
              className="input-field"
              placeholder="Tu nombre"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="auth-label flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Correo electrónico
            </label>
            <input
              id="contact-email"
              type="email"
              required
              className="input-field"
              placeholder="tu@email.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="contact-subject" className="auth-label">
              Asunto (opcional)
            </label>
            <input
              id="contact-subject"
              type="text"
              maxLength={200}
              className="input-field"
              placeholder="¿En qué podemos ayudarte?"
              value={form.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="auth-label flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Mensaje
            </label>
            <textarea
              id="contact-message"
              required
              minLength={10}
              rows={6}
              className="input-field resize-y min-h-[140px]"
              placeholder="Cuéntanos con detalle tu consulta o sugerencia..."
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
            />
          </div>

          {sendMutation.isError && (
            <div className="auth-error">
              No se pudo enviar el mensaje. Verifica los datos e inténtalo de nuevo.
            </div>
          )}

          <button
            type="submit"
            disabled={sendMutation.isPending}
            className="btn-primary w-full sm:w-auto gap-2"
          >
            {sendMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar mensaje
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
