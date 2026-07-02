import React from 'react';
import { MessageSquare } from 'lucide-react';

const ChatEmptyState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center mb-4">
      <MessageSquare className="w-10 h-10 text-violet-600 dark:text-violet-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
      Tus mensajes
    </h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
      Selecciona una conversación para ver el historial de mensajes o inicia un chat desde una postulación o propiedad.
    </p>
  </div>
);

export default ChatEmptyState;
