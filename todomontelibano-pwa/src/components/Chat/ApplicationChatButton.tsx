import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { getConversationByApplication } from '../../lib/chatApi';

interface ApplicationChatButtonProps {
  applicationId: string;
  className?: string;
}

const ApplicationChatButton: React.FC<ApplicationChatButtonProps> = ({
  applicationId,
  className = 'btn-primary text-sm py-2 px-4 flex items-center',
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const conversation = await getConversationByApplication(applicationId);
      navigate(`/messages/${conversation.id}`);
    } catch {
      navigate('/messages');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      <MessageSquare className="w-4 h-4 mr-2" />
      {loading ? 'Cargando...' : 'Mensajes'}
    </button>
  );
};

export default ApplicationChatButton;
