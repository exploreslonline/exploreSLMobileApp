// services/apiService.js

class ApiService {
  constructor() {
    // Updated to match your FastAPI server on port 8000
    this.BACKEND_URL = __DEV__ 
      ? 'http://10.0.2.2:8000'  // For Android emulator - CHANGED FROM 5000 to 8000
      : 'http://127.0.0.1:8000';  // For physical device - CHANGED FROM 5000 to 8000
    
    // Alternative URLs to try if the above doesn't work:
    // this.BACKEND_URL = 'http://192.168.1.10:8000';  // Replace with your computer's IP
    
    this.defaultTimeout = 15000; // 15 seconds
  }

  // Helper method to handle fetch requests with timeout
  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

    try {
      console.log(`Making request to: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data received:', data);
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your internet connection');
      }
      
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Test backend connection
  async testConnection() {
    try {
      console.log(`Testing connection to: ${this.BACKEND_URL}`);
      const response = await this.makeRequest(`${this.BACKEND_URL}/api/mobile/health`);
      console.log('Connection test successful:', response);
      return response;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      throw error;
    }
  }

  // Get test data to verify database connection
  async getTestData() {
    try {
      const response = await this.makeRequest(`${this.BACKEND_URL}/api/mobile/test-data`);
      return response;
    } catch (error) {
      console.error('Failed to get test data:', error);
      throw error;
    }
  }

  // Fetch approved offers with optional filters
  async fetchOffers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString 
        ? `${this.BACKEND_URL}/api/mobile/offers?${queryString}` 
        : `${this.BACKEND_URL}/api/mobile/offers`;
      
      console.log('Fetching offers from:', url);
      
      const data = await this.makeRequest(url);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch offers');
      }

      return data;
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  }

  // Fetch single offer by ID
  async fetchOfferById(offerId) {
    try {
      const url = `${this.BACKEND_URL}/api/mobile/offers/${offerId}`;
      console.log('Fetching offer from:', url);
      
      const data = await this.makeRequest(url);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch offer');
      }

      return data;
    } catch (error) {
      console.error('Error fetching offer:', error);
      throw error;
    }
  }

  // Fetch categories
  async fetchCategories() {
    try {
      const url = `${this.BACKEND_URL}/api/mobile/offers/categories`;
      console.log('Fetching categories from:', url);
      
      const data = await this.makeRequest(url);
      
      if (!data.success) {
        new Error(data.message || 'Failed to fetch categories');
      }

      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get backend status
  async getBackendStatus() {
    try {
      const response = await this.makeRequest(`${this.BACKEND_URL}/`);
      return response;
    } catch (error) {
      console.error('Failed to get backend status:', error);
      throw error;
    }
  }

  // Method to change backend URL dynamically
  setBackendUrl(url) {
    this.BACKEND_URL = url;
    console.log(`Backend URL changed to: ${this.BACKEND_URL}`);
  }

  // Get current backend URL
  getBackendUrl() {
    return this.BACKEND_URL;
  }
}

export default new ApiService();