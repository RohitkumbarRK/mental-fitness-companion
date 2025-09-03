import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../utils/auth';
import { getUserStats, getMoodStats } from '../utils/api';
import { FiMessageSquare, FiBook, FiBarChart2, FiAward, FiArrowRight } from 'react-icons/fi';
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

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [moodStats, setMoodStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const [userStats, moodStatsData] = await Promise.all([
          getUserStats(),
          getMoodStats()
        ]);
        
        setStats(userStats);
        setMoodStats(moodStatsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Chart data
  const chartData = {
    labels: moodStats?.mood_trend.map(item => format(new Date(item.date), 'MMM d')) || [],
    datasets: [
      {
        label: 'Mood',
        data: moodStats?.mood_trend.map(item => item.value) || [],
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
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Welcome back, {user?.username}!
      </h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Streak</h3>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <FiAward className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.streak || 0} days</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Journal Entries</h3>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <FiBook className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.journal_entries || 0}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Mood Check-ins</h3>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.mood_checkins || 0}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Badges</h3>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <FiAward className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats?.badges?.length || 0}</p>
        </div>
      </div>
      
      {/* Mood chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Mood Trend (Last 7 Days)
          </h2>
          <div className="h-64">
            {moodStats?.mood_trend?.some(item => item.value !== null) ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>No mood data available yet. Start tracking your mood!</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Daily Check-in
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Track your mood, energy, and focus levels to gain insights into your mental well-being.
          </p>
          <Link href="/mood/check-in" className="btn-primary w-full flex items-center justify-center">
            <span>Daily Check-in</span>
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
            <FiMessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Chat with AI Coach
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Get personalized guidance and support from your AI mental fitness coach.
          </p>
          <Link href="/chat" className="text-primary-600 dark:text-primary-400 font-medium flex items-center">
            Start chatting
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
            <FiBook className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Journal Your Thoughts
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Process your thoughts and emotions through guided journaling with AI insights.
          </p>
          <Link href="/journal/new" className="text-primary-600 dark:text-primary-400 font-medium flex items-center">
            Write in journal
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
            <FiBarChart2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            View Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Track your mental fitness journey and see how far you've come.
          </p>
          <Link href="/progress" className="text-primary-600 dark:text-primary-400 font-medium flex items-center">
            See progress
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}