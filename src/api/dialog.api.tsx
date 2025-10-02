import axios from 'axios';
import { DIALOG_URL } from './urls';
import { PackageItem } from './types';

export const getDialogPackages = async (): Promise<PackageItem[]> => {
  try {
    console.log('Fetching Dialog data from:', DIALOG_URL);
    const response = await axios.get<PackageItem[]>(DIALOG_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching Dialog packages:', error);
    throw error;
  }
};
