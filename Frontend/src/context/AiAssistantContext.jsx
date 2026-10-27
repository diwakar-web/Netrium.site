import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getApiUrl, safeJsonParse } from '../utils/api';

const AiAssistantContext = createContext(null);

export function AiAssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('netrium_ai_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState(null);
  const inputRef = useRef(null);

  // Sync history to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('netrium_ai_history', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  const openDrawer = useCallback(({ prompt = '', mode = 'chat', autoFocus = true } = {}) => {
    setIsOpen(true);
    if (prompt) {
      setInputValue(prompt);
    }
    if (autoFocus) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Position cursor at end of text
          const len = inputRef.current.value.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 150);
    }
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
      }
      return next;
    });
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setErrorNotice(null);
  }, []);

  const sendMessage = useCallback(async (textToSend, mode = 'chat') => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    setErrorNotice(null);

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const payloadHistory = messages
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await fetch(getApiUrl('/api/ai/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          history: payloadHistory,
          mode
        })
      });

      const data = await safeJsonParse(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Error generating AI response');
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.reply
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('[NetAI Assistant Error]', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `### Connection Notice\n\nI encountered an issue communicating with the NetAI gateway: \n\n\`${err.message || 'Network error'}\`\n\nPlease ensure your backend server is accessible at \`${getApiUrl()}\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: 'system-notice'
      };
      setMessages(prev => [...prev, errorMsg]);
      setErrorNotice(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  return (
    <AiAssistantContext.Provider
      value={{
        isOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
        inputValue,
        setInputValue,
        messages,
        sendMessage,
        clearChat,
        isLoading,
        errorNotice,
        inputRef
      }}
    >
      {children}
    </AiAssistantContext.Provider>
  );
}

export function useAiAssistant() {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error('useAiAssistant must be used within an AiAssistantProvider');
  }
  return ctx;
}
