import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import ChatInput from './components/ChatInput';
import Toast from './components/Toast';
import { api } from './services/api';

function AppContent() {
  const [characters, setCharacters] = useState([]);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [toast, setToast] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      const chars = await api.getCharacters();
      setCharacters(chars);
      
      // Restore last selected character
      const lastCharId = localStorage.getItem('lastCharacter');
      const selectedChar = chars.find(c => c.id === lastCharId) || chars[0];
      
      if (selectedChar) {
        setCurrentCharacter(selectedChar);
        await loadHistory(selectedChar.id);
      }
    } catch (error) {
      showToast('Karakterler yüklenemedi!');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async (characterId) => {
    try {
      const data = await api.getHistory(characterId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading history:', error);
      setMessages([]);
    }
  };

  const handleCharacterChange = useCallback(async (characterId) => {
    const char = characters.find(c => c.id === characterId);
    if (char) {
      setCurrentCharacter(char);
      localStorage.setItem('lastCharacter', characterId);
      await loadHistory(characterId);
    }
  }, [characters]);

  const handleClearHistory = useCallback(async () => {
    if (!currentCharacter) return;
    
    if (!confirm(`${currentCharacter.name} ile olan konuşma geçmişini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      await api.clearHistory(currentCharacter.id);
      setMessages([]);
      showToast('Geçmiş temizlendi');
    } catch (error) {
      showToast('Geçmiş temizlenemedi!');
      console.error(error);
    }
  }, [currentCharacter]);

  const handleSendMessage = useCallback(async (text) => {
    if (!currentCharacter) return;

    // Add user message
    const userMessage = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const data = await api.sendMessage(currentCharacter.id, text);
      
      // Add bot response
      const botMessage = { role: 'model', text: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      showToast(error.message || 'Bir hata oluştu');
      // Remove user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsTyping(false);
    }
  }, [currentCharacter]);

  const showToast = (message) => {
    setToast(message);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 p-0 md:p-5">
      <div className="w-full max-w-3xl h-full md:h-[calc(100vh-40px)] md:max-h-[900px] 
                      bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
                      md:rounded-3xl shadow-2xl overflow-hidden
                      flex flex-col border-0 md:border border-white/20">
        <Header
          character={currentCharacter}
          characters={characters}
          onCharacterChange={handleCharacterChange}
          onClearHistory={handleClearHistory}
        />
        
        <ChatArea
          messages={messages}
          character={currentCharacter}
          isTyping={isTyping}
        />
        
        <ChatInput
          onSend={handleSendMessage}
          disabled={isTyping}
        />
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
