import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import EmptyState from './EmptyState';

export default function ChatArea({ messages, character, isTyping }) {
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (messages.length === 0 && !isTyping) {
    return <EmptyState characterName={character?.name} />;
  }

  return (
    <main 
      ref={chatRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
    >
      {messages.map((msg, index) => (
        <ChatMessage 
          key={index} 
          message={msg} 
          character={character}
        />
      ))}
      {isTyping && (
        <ChatMessage 
          isTyping={true} 
          character={character}
        />
      )}
    </main>
  );
}
