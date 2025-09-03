import Head from 'next/head';
import { useAuth } from '../../utils/auth';
import { ProtectRoute } from '../../utils/auth';
import MoodCheckIn from '../../components/MoodCheckIn';

function MoodCheckInPage() {
  return (
    <>
      <Head>
        <title>Daily Check-in | MindfulAI</title>
      </Head>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Daily Check-in
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Track your mood, energy, and focus levels to gain insights into your mental well-being.
          Regular check-ins help you identify patterns and trends over time.
        </p>
        
        <MoodCheckIn />
      </div>
    </>
  );
}

export default function ProtectedMoodCheckInPage() {
  return (
    <ProtectRoute>
      <MoodCheckInPage />
    </ProtectRoute>
  );
}