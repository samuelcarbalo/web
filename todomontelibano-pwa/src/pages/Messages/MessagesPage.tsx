import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatList from '../../components/Chat/ChatList';
import ChatWindow from '../../components/Chat/ChatWindow';
import ChatEmptyState from '../../components/Chat/ChatEmptyState';
import { useConversations } from '../../hooks/useChat';

const MessagesPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | undefined>(conversationId);

  const { data, isLoading } = useConversations();
  const conversations = data?.results ?? [];

  const activeId = selectedId || conversationId;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    navigate(`/messages/${id}`, { replace: true });
  };

  const handleBack = () => {
    setSelectedId(undefined);
    navigate('/messages', { replace: true });
  };

  const showMobileChat = !!activeId;

  return (
    <div className="page-container page-section">
      <div className="card-static !p-0 overflow-hidden h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] h-full">
          {/* Sidebar — lista de conversaciones */}
          <div
            className={`border-r border-gray-200/80 dark:border-gray-800/80 flex flex-col h-full ${
              showMobileChat ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="px-4 py-4 border-b border-gray-200/80 dark:border-gray-800/80">
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                Mensajes
              </h1>
            </div>
            <ChatList
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              isLoading={isLoading}
            />
          </div>

          {/* Ventana de chat */}
          <div
            className={`flex flex-col h-full ${
              showMobileChat ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {activeId ? (
              <ChatWindow
                conversationId={activeId}
                onBack={handleBack}
                showBack
              />
            ) : (
              <ChatEmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
