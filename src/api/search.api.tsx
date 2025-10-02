import axios from 'axios';
import { SEARCH_URL } from './urls';

export const searchQuery = async (query: string) => {
  try {
    const response = await axios.get(`${SEARCH_URL}?q=${encodeURIComponent(query)}`);
    return response.data.results || [];
  } catch (error) {
    console.error('Search API error:', error);
    return [];
  }
};
