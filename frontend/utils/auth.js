import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUserFromCookies() {
      const token = Cookies.get('token');
      if (token) {
        try {
          axios.defaults.headers.Authorization = `Bearer ${token}`;
          const { data } = await axios.get(`${process.env.API_URL}/api/users/me`);
          if (data) setUser(data);
        } catch (error) {
          Cookies.remove('token');
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUserFromCookies();
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const { data } = await axios.post(`${process.env.API_URL}/api/users/token`, formData);
      if (data.access_token) {
        Cookies.set('token', data.access_token, { expires: 1 });
        axios.defaults.headers.Authorization = `Bearer ${data.access_token}`;
        const { data: userData } = await axios.get(`${process.env.API_URL}/api/users/me`);
        setUser(userData);
        return true;
      }
    } catch (error) {
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const { data } = await axios.post(`${process.env.API_URL}/api/users/register`, {
        username,
        email,
        password,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    delete axios.defaults.headers.Authorization;
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const ProtectRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return children;
};