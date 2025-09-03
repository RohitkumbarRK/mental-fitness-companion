import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/auth';
import { ProtectRoute } from '../../utils/auth';
import { getJournalEntries, deleteJournalEntry } from '../../utils/api';
import { FiPlus, FiEdit, FiTrash2, FiCalendar, FiTag } from 'react-icons/fi';
import { format } from 'date-fns';

function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchEntries() {
      try {
        const data = await getJournalEntries();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching journal entries:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEntries();
  }, []);
  
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await deleteJournalEntry(id);
        setEntries(entries.filter(entry => entry.id !== id));
      } catch (error) {
        console.error('Error deleting journal entry:', error);
        alert('Failed to delete journal entry. Please try again.');
      }
    }
  };
  
  return (
    <>
      <Head>
        <title>Journal | MindfulAI</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Journal
          </h1>
          
          <Link href="/journal/new" className="btn-primary flex items-center">
            <FiPlus className="mr-2" />
            New Entry
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Loading journal entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              No Journal Entries Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start journaling to track your thoughts, feelings, and experiences.
              Our AI will provide insights to help you understand patterns in your thinking.
            </p>
            <Link href="/journal/new" className="btn-primary inline-flex items-center">
              <FiPlus className="mr-2" />
              Create Your First Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                    <FiCalendar className="mr-1" />
                    <span>{format(new Date(entry.created_at), 'MMMM d, yyyy h:mm a')}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link href={`/journal/${entry.id}`} className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                      <FiEdit className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {entry.mood && (
                  <div className="mb-3">
                    <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm px-3 py-1 rounded-full">
                      Mood: {entry.mood}
                    </span>
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                    {entry.content.length > 300 
                      ? `${entry.content.substring(0, 300)}...` 
                      : entry.content}
                  </p>
                </div>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2">
                    <FiTag className="text-gray-500 dark:text-gray-400" />
                    {entry.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {entry.insights && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      AI Insights:
                    </h4>
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">
                      {entry.insights}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 text-right">
                  <Link href={`/journal/${entry.id}`} className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                    Read more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function ProtectedJournalPage() {
  return (
    <ProtectRoute>
      <JournalPage />
    </ProtectRoute>
  );
}