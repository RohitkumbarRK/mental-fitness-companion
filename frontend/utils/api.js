import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API functions for chat
export const sendChatMessage = async (message) => {
  try {
    const response = await api.post('/api/chat/message', { message });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const getChatHistory = async () => {
  try {
    const response = await api.get('/api/chat/history');
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

export const clearChatHistory = async () => {
  try {
    const response = await api.delete('/api/chat/history');
    return response.data;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};

// API functions for journal
export const createJournalEntry = async (journalData) => {
  try {
    const response = await api.post('/api/journal', journalData);
    return response.data;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

export const getJournalEntries = async () => {
  try {
    const response = await api.get('/api/journal');
    return response.data;
  } catch (error) {
    console.error('Error getting journal entries:', error);
    throw error;
  }
};

export const getJournalEntry = async (id) => {
  try {
    const response = await api.get(`/api/journal/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting journal entry:', error);
    throw error;
  }
};

export const deleteJournalEntry = async (id) => {
  try {
    const response = await api.delete(`/api/journal/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

// API functions for mood
export const createMoodEntry = async (moodData) => {
  try {
    const response = await api.post('/api/mood', moodData);
    return response.data;
  } catch (error) {
    console.error('Error creating mood entry:', error);
    throw error;
  }
};

export const getMoodEntries = async () => {
  try {
    const response = await api.get('/api/mood');
    return response.data;
  } catch (error) {
    console.error('Error getting mood entries:', error);
    throw error;
  }
};

export const getMoodStats = async () => {
  try {
    const response = await api.get('/api/mood/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting mood stats:', error);
    throw error;
  }
};

// API functions for user
export const getUserStats = async () => {
  try {
    const response = await api.get('/api/users/stats');
    return response.data;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};