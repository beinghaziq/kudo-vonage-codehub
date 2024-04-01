import { baseService } from './baseService.js';

const createTranslationResource = async (targetLanguage, sourceLanguage, gender, authToken) => {
  const requestData = {
    clientId: 'kudo-prod-payments-web-client',
    sourceLanguages: [`${sourceLanguage}`],
    targetLanguages: targetLanguage,
    voiceGender: gender,
  };

  try {
    const response = await baseService.post(
      'https://external-api.kudoway.com/api/v1/translation_resource',
      JSON.stringify(requestData),
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': authToken,
        },
      }
    );
    if (!response.data) {
      throw new Error('Failed to create translation resource');
    }

    return response.data.body.id;
  } catch (error) {
    console.error('Error creating translation resource:', error);
    return null;
  }
};

export default createTranslationResource;
