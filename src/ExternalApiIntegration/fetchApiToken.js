import { baseService } from './baseService.js';

const FetchApiToken = async () => {
  try {
    const response = await baseService.post(
      'https://external-api-staging.meetkudo.com/api/v1/generate_token',
      JSON.stringify({
        clientId: 'kudo-prod-payments-web-client',
        clientSecret: '4F4qk/KpemGJb3NKTTR0BRdlmrjRBlBh0L7hLbbqJFM=',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data) {
      throw new Error('Failed to fetch token');
    }

    console.log('Token Generated');
    return response.data.body;
  } catch (error) {
    console.error('Error creating auth token:', error);
    return null;
  }
};

export default FetchApiToken;
