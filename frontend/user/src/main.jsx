import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Global axios interceptor to handle authentication errors gracefully
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors silently (user not authenticated)
    if (error.response?.status === 401) {
      // Don't log 401 errors to console - they're expected for unauthenticated users
      return Promise.reject(error);
    }
    // Log other errors normally
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
