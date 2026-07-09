import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatComposerProps {
  onSend: (text: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatComposer: React.FC<ChatComposerProps> = ({
  onSend,
  onTyping,
  disabled = false,
  placeholder = 'Escribe un mensaje...',
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 px-4 py-3 border-t border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl"
    >
      <textarea
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="input-field flex-1 resize-none min-h-[44px] max-h-32 py-3"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="btn-primary !p-3 !rounded-full shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Enviar mensaje"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};

export default ChatComposer;
