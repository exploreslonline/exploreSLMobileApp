import axios from 'axios';
import { LIVING_COST_URL } from './urls';

export const getLivingCostData = async (): Promise<string> => {
  try {
    console.log('Fetching cost of living data from:', LIVING_COST_URL);
    const response = await axios.get(LIVING_COST_URL);
    
    // Log the full response to debug
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
    // FastAPI returns the data directly, not wrapped in .data
    // The response.data IS the object with content, tags, etc.
    if (response.data && response.data.content) {
      return response.data.content;
    } else {
      throw new Error('Content not found in response');
    }
  } catch (error) {
    console.error('Error fetching cost of living data:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    throw error;
  }
};