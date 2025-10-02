// src/api/topbeaches.api.ts
import axios from 'axios';
import { TOP_BEACHES_URL } from './urls';

export const getTopBeachesData = async (): Promise<string> => {
  try {
    console.log('Fetching top beaches data from:', TOP_BEACHES_URL);
    const response = await axios.get(TOP_BEACHES_URL);
    return response.data.content;
  } catch (error) {
    console.error('Error fetching top beaches data:', error);
    throw error;
  }
};
