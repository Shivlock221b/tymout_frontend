import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './styles/index.css';
import App from './App';
import { queryClient, QueryClientProvider, ReactQueryDevtools } from './query/queryClient';
import { initializeAuth } from './stores/authStore';

// Set up axios defaults for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000'; // API Gateway URL is on port 3000
axios.defaults.withCredentials = true; // Enable cookies for cross-origin requests

// Initialize auth store manually (preventing circular dependencies)
initializeAuth();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>

    </QueryClientProvider>
  </React.StrictMode>
);
