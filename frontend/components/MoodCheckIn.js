import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  FiSmile,
  FiSun,
  FiTarget,
  FiMoon,
  FiActivity,
  FiUsers,
  FiAlertTriangle,
  FiHeart
} from 'react-icons/fi';
import { createMoodEntry } from '../utils/api';

const MoodCheckIn = () => {
  const router = useRouter();

  // Core scores
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [focusLevel, setFocusLevel] = useState(5);

  // Additional clarity inputs (stored in structured notes)
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [anxietyLevel, setAnxietyLevel] = useState(5);
  const [exerciseMinutes, setExerciseMinutes] = useState(0);
  const [mindfulnessPracticed, setMindfulnessPracticed] = useState(false);
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [activities, setActivities] = useState([]);
  const [gratitude, setGratitude] = useState('');

  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const ACTIVITY_OPTIONS = [
    'Work/Study',
    'Social',
    'Exercise',
    'Outdoors',
    'Relaxation',
    'Hobby',
    'Travel',
    'Family',
  ];

  const toggleActivity = (label) => {
    setActivities((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Build structured notes so backend model doesn't need to change
      const structuredNotes = [
        notes?.trim() ? `Notes: ${notes.trim()}` : null,
        `Sleep: ${sleepHours}h`,
        `Stress: ${stressLevel}/10`,
        `Anxiety: ${anxietyLevel}/10`,
        `Exercise: ${exerciseMinutes} min`,
        `Mindfulness: ${mindfulnessPracticed ? 'Yes' : 'No'}`,
        `Medication: ${medicationTaken ? 'Yes' : 'No'}`,
        `Activities: ${activities.length ? activities.join(', ') : '—'}`,
        gratitude?.trim() ? `Gratitude: ${gratitude.trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      await createMoodEntry({
        mood_score: moodScore,
        energy_level: energyLevel,
        focus_level: focusLevel,
        notes: structuredNotes || null,
      });

      router.push('/mood');
    } catch (error) {
      console.error('Error submitting mood check-in:', error);
      alert('Failed to submit mood check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSlider = (value, setValue, icon, label, color) => (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        {icon}
        <label className="ml-2 text-gray-700 dark:text-gray-300">{label}</label>
      </div>
      <div className="flex items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Low</span>
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${color}`}
        />
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">High</span>
      </div>
      <div className="text-center mt-1 font-medium text-gray-700 dark:text-gray-300">
        {value}/10
      </div>
    </div>
  );

  const renderChip = (label) => (
    <button
      type="button"
      key={label}
      onClick={() => toggleActivity(label)}
      className={`px-3 py-1 rounded-full text-sm border transition ${
        activities.includes(label)
          ? 'bg-primary-600 text-white border-primary-600'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
        Daily Check-In
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Core sliders */}
        {renderSlider(
          moodScore,
          setMoodScore,
          <FiSmile className="w-5 h-5 text-yellow-500" />,
          "How's your mood today?",
          'bg-yellow-200 dark:bg-yellow-900'
        )}

        {renderSlider(
          energyLevel,
          setEnergyLevel,
          <FiSun className="w-5 h-5 text-orange-500" />,
          'Energy level',
          'bg-orange-200 dark:bg-orange-900'
        )}

        {renderSlider(
          focusLevel,
          setFocusLevel,
          <FiTarget className="w-5 h-5 text-blue-500" />,
          'Focus level',
          'bg-blue-200 dark:bg-blue-900'
        )}

        {/* Additional clarity inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <FiMoon className="text-indigo-500" /> Sleep hours
            </label>
            <input
              type="number"
              min="0"
              max="16"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
              <FiActivity className="text-emerald-500" /> Exercise (minutes)
            </label>
            <input
              type="number"
              min="0"
              max="300"
              step="5"
              value={exerciseMinutes}
              onChange={(e) => setExerciseMinutes(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {renderSlider(
            stressLevel,
            setStressLevel,
            <FiAlertTriangle className="w-5 h-5 text-red-500" />,
            'Stress level',
            'bg-red-200 dark:bg-red-900'
          )}

          {renderSlider(
            anxietyLevel,
            setAnxietyLevel,
            <FiHeart className="w-5 h-5 text-pink-500" />,
            'Anxiety level',
            'bg-pink-200 dark:bg-pink-900'
          )}
        </div>

        {/* Activities chips */}
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Activities</label>
          <div className="flex flex-wrap gap-2">{ACTIVITY_OPTIONS.map(renderChip)}</div>
        </div>

        {/* Mindfulness & Medication */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={mindfulnessPracticed}
              onChange={(e) => setMindfulnessPracticed(e.target.checked)}
              className="w-4 h-4"
            />
            Practiced mindfulness today
          </label>
          <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={medicationTaken}
              onChange={(e) => setMedicationTaken(e.target.checked)}
              className="w-4 h-4"
            />
            Took prescribed medication
          </label>
        </div>

        {/* Gratitude and Notes */}
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Gratitude (optional)</label>
          <input
            type="text"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="Something you're grateful for today..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any thoughts or reflections about your day..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            rows="3"
          />
        </div>

        <button type="submit" className="w-full btn-primary py-3" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Check-In'}
        </button>
      </form>
    </div>
  );
};

export default MoodCheckIn;