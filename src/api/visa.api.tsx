import axios from 'axios';
import { VISA_URL } from './urls';

export const getVisaData = async (): Promise<string> => {
  try {
    console.log('Fetching visa data from:', VISA_URL);
    const response = await axios.get(VISA_URL); // returns JSON
    return response.data.content; // ✅ use 'content' key from your backend response
  } catch (error) {
    console.error('Error fetching visa data:', error);
    throw error;
  }
};
