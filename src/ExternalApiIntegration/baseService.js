import axios from 'axios';

const apiService = () => {
  const instance = axios.create();

  return instance;
};

export const baseService = apiService();
