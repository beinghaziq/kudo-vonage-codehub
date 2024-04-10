// Ensure you have installed the following React packages: react-use-websocket and file-saver
import useWebSocket from 'react-use-websocket';
import { useEffect, useState } from 'react';
import { getAudioContext } from '../constants/AudioContext';
import { base64ToArrayBuffer, publishTranslatedAudio } from '../Helpers/PublishTargetAudio';
import { publishSourceAudioToWebsocket } from '../Helpers/PublishSourceAudio';
import { predefinedTargetLanguagesList } from '../constants/LanguagesList';

export const WebsocketConnection = ({ resourceId, tbPublisherCallback, publishCaptionCallback, authToken }) => {
  const EXTERNAL_API_SOCKET_URL = process.env.REACT_APP_EXTERNAL_API_SOCKET_URL + `/translate?id=${resourceId}`;
  const [languageAudioData, _setLanguageAudioData] = useState({});
  const [mediaStreamDestinations, _setMediaStreamDestinations] = useState({});
  const audioContext = getAudioContext();

  // Socket Connection
  const { sendMessage } = useWebSocket(EXTERNAL_API_SOCKET_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    onMessage: (message) => {
      processResponseFromWebsocket(message);
    },
    onClose: (e) => {
      console.log('closed', e);
    },
    onError: (e) => console.error('Error in websocket', e),
    shouldReconnect: () => false,
    protocols: ['Authorization', authToken],
  });

  // initialize data
  const initData = () => {
    predefinedTargetLanguagesList.forEach((language) => {
      const langCode = language.value;
      languageAudioData[langCode] = {};
      languageAudioData[langCode]['isPlaying'] = false;
      languageAudioData[langCode]['data'] = [];

      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      mediaStreamDestinations[langCode] = mediaStreamDestination;
      tbPublisherCallback(langCode, mediaStreamDestination);
    });
  };

  const processResponseFromWebsocket = (response) => {
    const data = JSON.parse(response.data);
    console.log('S2S Response:', data);
    const targetLanguage = data.targetLanguage;

    languageAudioData[targetLanguage]['data'].push({
      requestId: data.requestId,
      audioBuffer: base64ToArrayBuffer(data.audioData),
      targetLanguage: data.targetLanguage,
      caption: data.text,
      audioDuration: data.audioDuration,
    });

    // Publish translated audio in the target language
    tbPublisherCallback(targetLanguage, mediaStreamDestinations[targetLanguage]);
    publishTranslatedAudio(
      targetLanguage,
      languageAudioData,
      mediaStreamDestinations[targetLanguage],
      publishCaptionCallback
    );
  };

  useEffect(() => {
    initData();
    publishSourceAudioToWebsocket(sendMessage);
  }, []);
};
