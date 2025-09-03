import { useRouter } from 'next/router';
import { useAuth } from '../utils/auth';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Pages that don't need authentication
  const publicPages = ['/login', '/register', '/'];
  const isPublicPage = publicPages.includes(router.pathname);
  
  // If on a public page or loading, just render the children (with Navbar visible too)
  if (isPublicPage || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }
  
  // If authenticated, render with sidebar
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </div>
    );
  }
  
  // If not authenticated and not on a public page, redirect to login
  if (!isAuthenticated && !isPublicPage) {
    router.push('/login');
    return <div>Redirecting...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;