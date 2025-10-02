import axios from 'axios';
import {TRANSPORT_URL} from './urls';

export const getTransportData = async (): Promise<string> => {
  try {
    console.log('Fetching transport data from:', TRANSPORT_URL);
    const response = await axios.get(TRANSPORT_URL);
    return response.data.content;
  } catch (error) {
    console.error('Error fetching transport data:', error);
    throw error;
  }
};
