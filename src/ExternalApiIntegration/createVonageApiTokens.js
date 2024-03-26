import { baseService } from './baseService.js';

export const createVonageApiTokens = async () => {
  try {
    const response = await baseService.post(
      'https://marketplaceapi-staging.meetkudo.com/api/v1/external_api/sessions',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'HTTP-X-API-TOKEN': 'daceac4f6a07265eef17857c',
        },
      }
    );
    if (!response.data) {
      throw new Error('Failed to create translation resource');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating translation resource:', error);
    return null;
  }
};
