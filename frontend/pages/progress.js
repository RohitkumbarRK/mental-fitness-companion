import { useEffect, useState, useMemo } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format } from 'date-fns';
import Link from 'next/link';
import { getMoodStats, getUserStats, getMoodEntries } from '../utils/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ProgressPage() {
  const [stats, setStats] = useState(null);
  const [moodStats, setMoodStats] = useState(null);
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [userStats, moodStatsData, entries] = await Promise.all([
          getUserStats(),
          getMoodStats(),
          getMoodEntries(),
        ]);
        setStats(userStats);
        setMoodStats(moodStatsData);
        setMoodEntries(entries || []);
      } catch (err) {
        console.error('Error loading progress data:', err);
        setError('Failed to load progress data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Prepare last 7 days labels
  const lastNDays = 7;
  const dateKeys = useMemo(() => {
    const arr = [];
    const now = new Date();
    for (let i = lastNDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      arr.push(key);
    }
    return arr;
  }, []);

  const lineLabels = dateKeys.map((k) => {
    const [y, m, d] = k.split('-');
    return format(new Date(Number(y), Number(m) - 1, Number(d)), 'MMM d');
  });

  // Map entries by date for quick lookup
  const dailyAggregates = useMemo(() => {
    const map = new Map();
    (moodEntries || []).forEach((e) => {
      const d = new Date(e.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });

    // average if multiple per day
    const avg = {};
    for (const [key, list] of map.entries()) {
      const mood = list.reduce((s, x) => s + (x.mood_score ?? 0), 0) / list.length;
      const energy = list.reduce((s, x) => s + (x.energy_level ?? 0), 0) / list.length;
      const focus = list.reduce((s, x) => s + (x.focus_level ?? 0), 0) / list.length;
      avg[key] = {
        mood: Number(mood.toFixed(1)),
        energy: Number(energy.toFixed(1)),
        focus: Number(focus.toFixed(1)),
      };
    }
    return avg;
  }, [moodEntries]);

  const moodSeries = dateKeys.map((k) => dailyAggregates[k]?.mood ?? null);
  const energySeries = dateKeys.map((k) => dailyAggregates[k]?.energy ?? null);
  const focusSeries = dateKeys.map((k) => dailyAggregates[k]?.focus ?? null);

  const lineData = {
    labels: lineLabels,
    datasets: [
      {
        label: 'Mood',
        data: moodSeries,
        borderColor: 'rgb(14, 165, 233)',
        backgroundColor: 'rgba(14, 165, 233, 0.3)',
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: 'Energy',
        data: energySeries,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.3)',
        tension: 0.3,
        spanGaps: true,
      },
      {
        label: 'Focus',
        data: focusSeries,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        tension: 0.3,
        spanGaps: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: { stepSize: 1 },
      },
    },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y}/10`;
          },
        },
      },
      title: { display: true, text: 'Well-being Trend (Last 7 Days)' },
    },
  };

  // Pie chart: Mood distribution (last 30 days)
  const pieBuckets = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 30);

    let low = 0; // 1-3
    let mid = 0; // 4-7
    let high = 0; // 8-10

    (moodEntries || []).forEach((e) => {
      const d = new Date(e.created_at);
      if (d < cutoff) return;
      const v = e.mood_score ?? 0;
      if (v >= 1 && v <= 3) low++;
      else if (v >= 4 && v <= 7) mid++;
      else if (v >= 8) high++;
    });

    return { low, mid, high };
  }, [moodEntries]);

  const pieData = {
    labels: ['Low (1-3)', 'Moderate (4-7)', 'High (8-10)'],
    datasets: [
      {
        data: [pieBuckets.low, pieBuckets.mid, pieBuckets.high],
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(234, 179, 8, 0.7)',
          'rgba(34, 197, 94, 0.7)',
        ],
        borderColor: ['rgb(239, 68, 68)', 'rgb(234, 179, 8)', 'rgb(34, 197, 94)'],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Mood Distribution (Last 30 Days)' },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((s, x) => s + x, 0);
            const val = context.parsed;
            const pct = total ? ((val / total) * 100).toFixed(0) : 0;
            return `${context.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Link href="/dashboard" className="text-primary-600 dark:text-primary-400 underline">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  const anyLineData = [...moodSeries, ...energySeries, ...focusSeries].some((v) => v !== null);
  const anyPieData = (pieBuckets.low + pieBuckets.mid + pieBuckets.high) > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Progress</h1>

      {/* Key stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Streak</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.streak || 0} days</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Journal Entries</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.journal_entries || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Mood Check-ins</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.mood_checkins || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Badges</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.badges?.length || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Trends</h2>
          <div className="h-72">
            {anyLineData ? (
              <Line data={lineData} options={lineOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>No trend data available yet. Start tracking your mood!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Mood Distribution</h2>
          <div className="h-72 flex items-center justify-center">
            {anyPieData ? (
              <Pie data={pieData} options={pieOptions} />
            ) : (
              <div className="text-gray-500 dark:text-gray-400">No mood entries in the last 30 days.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Highlights</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
          <li>Keep your streak going by checking in daily.</li>
          <li>Use the journal to reflect on good and tough days.</li>
          <li>Chat with the AI coach for personalized tips.</li>
        </ul>
      </div>
    </div>
  );
}