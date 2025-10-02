import axios from 'axios';
import {HISTORICAL_PLACES_URL} from './urls';

export const getHistoricalData = async (): Promise<string> => {
  try {
    console.log('Fetching historical places data from:', HISTORICAL_PLACES_URL);
    const response = await axios.get(HISTORICAL_PLACES_URL);
    return response.data.content;
  } catch (error) {
    console.error('Error fetching historical places data:', error);
    throw error;
  }
};
