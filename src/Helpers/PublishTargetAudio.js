import { getAudioContext } from '../constants/AudioContext.js';

// Function to convert a base64 string to an ArrayBuffer
export const base64ToArrayBuffer = (data) => {
  const binaryString = window.atob(data); // Decode base64
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Play Audio in Sequence
export const publishTranslatedAudio = async (
  language,
  languageAudioData,
  destinationStream,
  publishCaptionCallback
) => {
  if (!languageAudioData[language].isPlaying) {
    const data = languageAudioData[language]['data'].shift();
    languageAudioData[language].isPlaying = true; // denotes that the language audio is still playing

    try {
      const audioContext = getAudioContext();
      const decodedAudioBuffer = await audioContext.decodeAudioData(data.audioBuffer); // decode data from Uint8Array
      const source = audioContext.createBufferSource();
      source.buffer = decodedAudioBuffer;
      source.connect(destinationStream);
      publishCaptionCallback(language, data.caption);
      source.start();
      // callback for when audio buffer has ended
      source.onended = () => {
        languageAudioData[language].isPlaying = false;
        // recalling for next audio to play
        if (languageAudioData[language]['data'].length > 0) {
          publishTranslatedAudio(language, languageAudioData, destinationStream, publishCaptionCallback);
        }
      };
    } catch (e) {
      console.log(`Error occurred while publishing ${language} ${data?.requestId} ${JSON.stringify(e)}`);
      languageAudioData[language].isPlaying = false;
    }
  }
};
