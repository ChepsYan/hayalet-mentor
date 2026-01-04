import { useState, useEffect } from 'react';

export default function Toast({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div 
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50
                  px-5 py-3 rounded-xl bg-gray-900 dark:bg-white 
                  text-white dark:text-gray-900 font-medium shadow-xl
                  transition-all duration-300
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {message}
    </div>
  );
}
