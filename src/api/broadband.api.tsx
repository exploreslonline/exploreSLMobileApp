import axios from 'axios';
import { BROADBAND_URL } from './urls';

export const getBroadbandData = async (): Promise<string[]> => {
  try {
    console.log('Fetching broadband data from:', BROADBAND_URL);
    const response = await axios.get(BROADBAND_URL);
    
    // Extract content from each page (e.g., prepaid and postpaid)
    return response.data.map((item: any) => item.content);
  } catch (error) {
    console.error('Error fetching broadband data:', error);
    throw error;
  }
};
