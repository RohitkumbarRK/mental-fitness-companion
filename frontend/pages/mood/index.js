import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../utils/auth';
import { ProtectRoute } from '../../utils/auth';
import { getMoodEntries, getMoodStats } from '../../utils/api';
import { FiPlus, FiCalendar, FiSmile, FiSun, FiTarget } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function MoodPage() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [entriesData, statsData] = await Promise.all([
          getMoodEntries(),
          getMoodStats()
        ]);
        
        setEntries(entriesData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching mood data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Chart data
  const chartData = {
    labels: stats?.mood_trend.map(item => format(new Date(item.date), 'MMM d')) || [],
    datasets: [
      {
        label: 'Mood',
        data: stats?.mood_trend.map(item => item.value) || [],
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
        tension: 0.3,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Mood: ${context.parsed.y}/10`;
          }
        }
      }
    },
  };
  
  const getMoodEmoji = (score) => {
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '🙁';
    return '😞';
  };
  
  return (
    <>
      <Head>
        <title>Mood Tracker | MindfulAI</title>
      </Head>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mood Tracker
          </h1>
          
          <Link href="/mood/check-in" className="btn-primary flex items-center">
            <FiPlus className="mr-2" />
            New Check-in
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400">Loading mood data...</p>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Streak</h3>
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <FiCalendar className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.streak_days || 0} days</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Avg. Mood</h3>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <FiSmile className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.average_mood ? `${stats.average_mood}/10` : 'N/A'}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Avg. Energy</h3>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <FiSun className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.average_energy ? `${stats.average_energy}/10` : 'N/A'}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Avg. Focus</h3>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <FiTarget className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.average_focus ? `${stats.average_focus}/10` : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Mood chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Mood Trend (Last 7 Days)
              </h2>
              <div className="h-64">
                {stats?.mood_trend?.some(item => item.value !== null) ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p>No mood data available yet. Start tracking your mood!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Recent check-ins */}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Recent Check-ins
            </h2>
            
            {entries.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-10 text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  No Check-ins Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Start tracking your mood, energy, and focus levels to gain insights into your mental well-being.
                </p>
                <Link href="/mood/check-in" className="btn-primary inline-flex items-center">
                  <FiPlus className="mr-2" />
                  Create Your First Check-in
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                        <FiCalendar className="mr-1" />
                        <span>{format(new Date(entry.created_at), 'MMMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <div className="text-2xl mb-1">{getMoodEmoji(entry.mood_score)}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Mood</div>
                        <div className="font-bold text-gray-800 dark:text-white">{entry.mood_score}/10</div>
                      </div>
                      
                      <div className="flex flex-col items-center p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Energy</div>
                        <div className="font-bold text-gray-800 dark:text-white">{entry.energy_level}/10</div>
                      </div>
                      
                      <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                        <div className="text-2xl mb-1">🎯</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Focus</div>
                        <div className="font-bold text-gray-800 dark:text-white">{entry.focus_level}/10</div>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Notes:
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {entry.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default function ProtectedMoodPage() {
  return (
    <ProtectRoute>
      <MoodPage />
    </ProtectRoute>
  );
}