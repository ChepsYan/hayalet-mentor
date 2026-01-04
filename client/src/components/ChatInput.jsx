import { useState, useRef, useEffect } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <footer className="p-4 border-t border-gray-200 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
          disabled={disabled}
          rows={1}
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600
                     bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white
                     placeholder-gray-400 dark:placeholder-gray-500
                     resize-none overflow-hidden
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 
                     text-white shadow-lg shadow-indigo-500/30
                     hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5
                     active:translate-y-0
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg
                     transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </footer>
  );
}
