import axios from 'axios';
import {TOP_PLACES_URL} from './urls';

export const getTopPlacesData = async (): Promise<string> => {
  try {
    console.log('Fetching top places data from:', TOP_PLACES_URL);
    const response = await axios.get(TOP_PLACES_URL);
    return response.data.content;
  } catch (error) {
    console.error('Error fetching top places data:', error);
    throw error;
  }
};
