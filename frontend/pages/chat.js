import { useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../utils/auth';
import { ProtectRoute } from '../utils/auth';
import ChatInterface from '../components/ChatInterface';

function ChatPage() {
  const { user } = useAuth();
  
  useEffect(() => {
    // Set page title
    document.title = 'AI Coach Chat | MindfulAI';
  }, []);
  
  return (
    <>
      <Head>
        <title>AI Coach Chat | MindfulAI</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Chat with Your AI Coach
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Have a conversation with your AI mental fitness coach. Ask questions, seek guidance, 
          or just chat about your day. Your coach is trained in CBT and mindfulness techniques 
          to help you build emotional resilience and mental strength.
        </p>
        
        <ChatInterface />
      </div>
    </>
  );
}

export default function ProtectedChatPage() {
  return (
    <ProtectRoute>
      <ChatPage />
    </ProtectRoute>
  );
}