import Head from 'next/head';
import { useAuth } from '../../utils/auth';
import { ProtectRoute } from '../../utils/auth';
import JournalEditor from '../../components/JournalEditor';

function NewJournalPage() {
  return (
    <>
      <Head>
        <title>New Journal Entry | MindfulAI</title>
      </Head>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          New Journal Entry
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Express your thoughts, feelings, and experiences. Journaling helps process emotions,
          gain clarity, and track your mental fitness journey. Our AI will provide insights to
          help you understand patterns in your thinking.
        </p>
        
        <JournalEditor />
      </div>
    </>
  );
}

export default function ProtectedNewJournalPage() {
  return (
    <ProtectRoute>
      <NewJournalPage />
    </ProtectRoute>
  );
}