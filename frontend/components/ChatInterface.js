import { useState, useEffect, useRef } from 'react';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../utils/api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // typing indicator
  const messagesEndRef = useRef(null);

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await getChatHistory();
        setMessages(history);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    
    loadChatHistory();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    // Always scroll to bottom when messages change or typing status updates
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to UI immediately
    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    
    // Clear input and set loading
    setInput('');
    setLoading(true);
    setIsTyping(true); // show typing indicator immediately
    
    try {
      // Simulate small delay for UX (optional)
      // await new Promise(r => setTimeout(r, 200));

      // Send message to API
      const response = await sendChatMessage(input);
      
      // Add AI response to messages
      const aiMessage = { 
        role: 'assistant', 
        content: response.response, 
        timestamp: new Date() 
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Set suggestions if any
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again later.', 
        timestamp: new Date() 
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setIsTyping(false); // hide typing indicator
    }
  };

  const handleClearChat = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      setSuggestions([]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">AI Coach Chat</h2>
        <button 
          onClick={handleClearChat}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          title="Clear chat history"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-center mb-4">No messages yet. Start a conversation with your AI coach!</p>
            <p className="text-center text-sm">Try asking about stress management, mindfulness techniques, or how to improve focus.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-gray-800 dark:text-white rounded-br-none' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            disabled={loading}
          />
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-r-md disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
        {(loading || isTyping) && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span>AI is typing…</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;