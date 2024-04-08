// Ensure you have installed the following React packages: react-use-websocket and file-saver
import useWebSocket from 'react-use-websocket';
import { useCallback, useEffect, useState } from 'react';
import { predefinedLanguages } from '../constants/PredefinedLanguages';
import { getAudioContext } from '../constants/AudioContext';

export const WebsocketConnection = ({
  dataBlobUrl,
  resourceId,
  isInterviewStarted,
  publishTranslatedAudio,
  connectMediaStreamToTokbox,
  authToken,
}) => {
  const SERVER_URL = `wss://external-api-preprod.meetkudo.com/api/v1/translate?id=${resourceId}`;
  const [languageAudioData, _setLanguageAudioData] = useState({});
  const [mediaStreamDestinations, _setMediaStreamDestinations] = useState({});
  const audioContext = getAudioContext();

  const { sendMessage } = useWebSocket(SERVER_URL, {
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

  const initializeData = () => {
    predefinedLanguages.forEach((language) => {
      const langCode = language.value;
      languageAudioData[langCode] = {};
      languageAudioData[langCode]['isPlaying'] = false;
      languageAudioData[langCode]['data'] = [];

      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      mediaStreamDestinations[langCode] = mediaStreamDestination;
      connectMediaStreamToTokbox(langCode, mediaStreamDestination);
    });

    console.log('languageAudioData', languageAudioData);
  };

  // converting audio blob to float32array and send to websocket
  const publishSourceAudioToWebsocket = async () => {
    let mediaStream;
    console.log('STARTED PUBLISHING!!!');
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // get media stream
      mediaStream = new MediaStream();
      mediaStream.addTrack(userMedia.getAudioTracks()[0]);
    }
    const audioSrc = audioContext.createMediaStreamSource(mediaStream);
    const processor = audioContext.createScriptProcessor(1024, 1, 1);

    // Processor to encode audio data to PCM and push encoded data to server
    processor.onaudioprocess = (event) => {
      const audioSamples = new Float32Array(event.inputBuffer.getChannelData(0));
      const PCM16iSamples = [];
      for (let i = 0; i < audioSamples.length; i++) {
        let val = Math.floor(32767 * audioSamples[i]);
        val = Math.min(32767, val);
        val = Math.max(-32768, val);
        PCM16iSamples.push(val);
      }
      sendMessage(JSON.stringify(new Int16Array(PCM16iSamples)));
    };

    audioSrc.connect(processor);
    processor.connect(audioContext.destination);
  };

  const processResponseFromWebsocket = (response) => {
    const data = JSON.parse(response.data);
    const audioBuffer = base64ToArrayBuffer(data.audioData);
    const targetLanguage = data.targetLanguage;
    const subtitle = data.text;
    const audioDuration = data.audioDuration;
    const requestId = data.requestId;

    languageAudioData[targetLanguage]['data'].push({
      requestId,
      audioBuffer,
      targetLanguage,
      subtitle,
      audioDuration,
    });

    playAudio(targetLanguage);
  };

  const playAudio = async (language) => {
    if (!languageAudioData[language].isPlaying) {
      const data = languageAudioData[language]['data'].shift();
      languageAudioData[language].isPlaying = true; // denotes that the language audio is still playing

      try {
        const decodedAudioBuffer = await audioContext.decodeAudioData(data.audioBuffer); // decode data from Uint8Array
        const source = audioContext.createBufferSource();
        source.buffer = decodedAudioBuffer;
        source.connect(mediaStreamDestinations[language]);
        console.log('decodedAudioBuffer:', decodedAudioBuffer);
        connectMediaStreamToTokbox(language, mediaStreamDestinations[language]);
        source.start();

        // callback for when audio buffer has ended
        source.onended = () => {
          languageAudioData[language].isPlaying = false;
          if (languageAudioData[language]['data'].length > 0) {
            playAudio(language); // recalling for next audio to play
          }
        };
      } catch (e) {
        console.log(`Error occurred while publishing ${language} ${data?.requestId} ${JSON.stringify(e)}`);
        languageAudioData[language].isPlaying = false;
      }

      publishTranslatedAudio(language, data.subtitle);
    }
  };

  // Function to convert a base64 string to an ArrayBuffer
  const base64ToArrayBuffer = (data) => {
    const binaryString = window.atob(data); // Decode base64
    const length = binaryString.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  useEffect(() => {
    initializeData();
    publishSourceAudioToWebsocket();
  }, []);
};
