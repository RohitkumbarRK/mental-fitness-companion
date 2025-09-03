import { useThemeSettings } from '../utils/theme';
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, setTheme, toggleTheme } = useThemeSettings();
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-800 dark:text-gray-200 font-medium">Theme</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Switch between light and dark mode</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1 rounded-md border ${theme === 'light' ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1 rounded-md border ${theme === 'dark' ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}
            >
              Dark
            </button>
            <button
              onClick={toggleTheme}
              className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Toggle
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Accessibility</h2>
        <label className="flex items-center justify-between">
          <div>
            <p className="text-gray-800 dark:text-gray-200 font-medium">Reduced Motion</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Minimize animations for motion sensitivity</p>
          </div>
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
            className="h-5 w-5"
          />
        </label>
      </div>
    </div>
  );
}