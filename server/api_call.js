// server/api_call.js - API calls handling
const express = require('express');
const router = express.Router();
const axios = require('axios');

// API configuration
const API_CONFIG = {
  baseURL: process.env.API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Create axios instance
const apiClient = axios.create(API_CONFIG);

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = process.env.API_TOKEN;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API response received from: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API request failed:', error.message);
    return Promise.reject(error);
  }
);

// Generic API call handler
router.post('/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const { data, params } = req.body;

    const response = await apiClient.post(`/${endpoint}`, data, { params });
    
    res.json({
      success: true,
      data: response.data,
      status: response.status
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// GET request handler
router.get('/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const { params } = req.query;

    const response = await apiClient.get(`/${endpoint}`, { 
      params: params ? JSON.parse(params) : {} 
    });
    
    res.json({
      success: true,
      data: response.data,
      status: response.status
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// PUT request handler
router.put('/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const { data, params } = req.body;

    const response = await apiClient.put(`/${endpoint}`, data, { params });
    
    res.json({
      success: true,
      data: response.data,
      status: response.status
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// DELETE request handler
router.delete('/:endpoint', async (req, res) => {
  try {
    const { endpoint } = req.params;
    const { params } = req.body;

    const response = await apiClient.delete(`/${endpoint}`, { params });
    
    res.json({
      success: true,
      data: response.data,
      status: response.status
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// Batch request handler
router.post('/batch', async (req, res) => {
  try {
    const { requests } = req.body;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        error: 'Requests array is required'
      });
    }

    // Execute all requests in parallel
    const promises = requests.map(request => {
      const { method, endpoint, data, params } = request;
      
      switch (method.toLowerCase()) {
        case 'get':
          return apiClient.get(endpoint, { params });
        case 'post':
          return apiClient.post(endpoint, data, { params });
        case 'put':
          return apiClient.put(endpoint, data, { params });
        case 'delete':
          return apiClient.delete(endpoint, { params });
        default:
          return Promise.reject(new Error(`Unsupported method: ${method}`));
      }
    });

    const responses = await Promise.allSettled(promises);
    
    const results = responses.map((response, index) => {
      if (response.status === 'fulfilled') {
        return {
          success: true,
          data: response.value.data,
          status: response.value.status
        };
      } else {
        return {
          success: false,
          error: response.reason.message,
          status: response.reason.response?.status || 500
        };
      }
    });

    res.json({
      success: true,
      results
    });
  } catch (error) {
    handleApiError(error, res);
  }
});

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Try to make a simple request to check API health
    const response = await apiClient.get('/health', { timeout: 5000 });
    
    res.json({
      success: true,
      status: 'connected',
      timestamp: new Date().toISOString(),
      responseTime: `${response.duration}ms`
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling function
function handleApiError(error, res) {
  console.error('API Error:', error.message);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    res.status(error.response.status).json({
      success: false,
      error: error.response.data?.message || error.message,
      status: error.response.status,
      data: error.response.data
    });
  } else if (error.request) {
    // The request was made but no response was received
    res.status(503).json({
      success: false,
      error: 'No response received from API',
      status: 503
    });
  } else {
    // Something happened in setting up the request
    res.status(500).json({
      success: false,
      error: error.message,
      status: 500
    });
  }
}

module.exports = router;
