import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { useStartRealEstateChat } from '../../hooks/useChat';
import Modal from '../UI/Modal';

interface ContactOwnerButtonProps {
  offerId: string;
  ownerName?: string;
  className?: string;
}

const ContactOwnerButton: React.FC<ContactOwnerButtonProps> = ({
  offerId,
  ownerName,
  className = 'w-full btn-primary font-bold py-3 text-sm rounded-3xl',
}) => {
  const navigate = useNavigate();
  const startChat = useStartRealEstateChat();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startChat.mutate(
      { offer_id: offerId, initial_message: message.trim() || undefined },
      {
        onSuccess: (conversation) => {
          setShowModal(false);
          navigate(`/messages/${conversation.id}`);
        },
      }
    );
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} className={className}>
        <MessageSquare className="w-4 h-4 mr-2 inline" />
        Contactar propietario
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Contactar a ${ownerName || 'el propietario'}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Envía un mensaje para consultar sobre la propiedad, negociar precio o coordinar una visita.
          </p>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="input-field"
            placeholder="Hola, estoy interesado en esta propiedad. ¿Podríamos agendar una visita?"
          />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={startChat.isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {startChat.isPending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ContactOwnerButton;
