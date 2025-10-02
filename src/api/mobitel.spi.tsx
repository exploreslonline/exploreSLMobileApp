import axios from 'axios';
import { MOBITEL_URL } from './urls';
import { PackageItem } from './types';

export const getMobitelPackages = async (): Promise<PackageItem[]> => {
  const response = await axios.get<PackageItem[]>(MOBITEL_URL);
  return response.data;
};
