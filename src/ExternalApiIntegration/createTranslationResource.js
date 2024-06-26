import { baseService } from './baseService.js';

const EXTERNAL_API_SERVER_URL = process.env.REACT_APP_EXTERNAL_API_SERVER_URL;
const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;

const createTranslationResource = async (targetLanguage, sourceLanguage, gender, authToken) => {
  const requestData = {
    clientId: CLIENT_ID,
    sourceLanguages: [sourceLanguage],
    targetLanguages: targetLanguage,
    voiceGender: gender,
    allowMultipleSourceLanguages: false,
  };

  try {
    const response = await baseService.post(EXTERNAL_API_SERVER_URL, JSON.stringify(requestData), {
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': authToken,
      },
    });
    if (!response.data) {
      throw new Error('Failed to create translation resource');
    }

    console.log('Created Translation Resource:', response.data.body.id);
    return response.data.body.id;
  } catch (error) {
    console.error('Error creating translation resource:', error);
    return null;
  }
};

export default createTranslationResource;
