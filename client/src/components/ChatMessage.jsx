import { useEffect, useRef } from 'react';

export default function ChatMessage({ message, character, isTyping = false }) {
  const isUser = message?.role === 'user';
  const messageRef = useRef(null);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, []);

  if (isTyping) {
    return (
      <div className="flex items-end gap-3 animate-fade-in">
        <img
          src={character?.avatar}
          alt={character?.name}
          className="w-8 h-8 rounded-xl object-cover shadow-md flex-shrink-0"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="bg-gray-100 dark:bg-gray-700/50 px-5 py-4 rounded-2xl rounded-bl-md border border-gray-200/50 dark:border-gray-600/30">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div ref={messageRef} className="flex justify-end animate-fade-in">
        <div className="max-w-[80%] bg-gradient-to-br from-indigo-500 to-purple-600 
                        text-white px-5 py-3 rounded-2xl rounded-br-md shadow-lg
                        shadow-indigo-500/20">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={messageRef} className="flex items-end gap-3 animate-fade-in">
      <img
        src={character?.avatar}
        alt={character?.name}
        className="w-8 h-8 rounded-xl object-cover shadow-md flex-shrink-0"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div className="max-w-[80%] bg-white dark:bg-gray-700/50 px-5 py-3 
                      rounded-2xl rounded-bl-md shadow-md border border-gray-100 dark:border-gray-600/30">
        <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">
          {message.text}
        </p>
      </div>
    </div>
  );
}
