import axios from 'axios';
import { LIVING_COST_URL } from './urls'; // Define this constant in urls.ts

export const getLivingCostData = async (): Promise<string> => {
  try {
    console.log('Fetching cost of living data from:', LIVING_COST_URL);
    const response = await axios.get(LIVING_COST_URL);
    return response.data.content;
  } catch (error) {
    console.error('Error fetching cost of living data:', error);
    throw error;
  }
};
