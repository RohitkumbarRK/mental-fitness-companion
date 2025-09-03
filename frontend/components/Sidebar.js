import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiHome, FiMessageSquare, FiBook, FiBarChart2, FiAward } from 'react-icons/fi';

const Sidebar = () => {
  const router = useRouter();
  
  const menuItems = [
    { name: 'Dashboard', icon: <FiHome className="w-5 h-5" />, href: '/dashboard' },
    { name: 'Chat', icon: <FiMessageSquare className="w-5 h-5" />, href: '/chat' },
    { name: 'Journal', icon: <FiBook className="w-5 h-5" />, href: '/journal' },
    { name: 'Mood Tracker', icon: <FiBarChart2 className="w-5 h-5" />, href: '/mood' },
    { name: 'Progress', icon: <FiAward className="w-5 h-5" />, href: '/progress' },
  ];
  
  return (
    <div className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary-600">MindfulAI</h1>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;