// Ensure you have installed the following React packages: react-use-websocket and file-saver
import useWebSocket from 'react-use-websocket';
import { useCallback, useEffect, useState } from 'react';

export const WebsocketConnection = ({
  dataBlobUrl,
  resourceId,
  isInterviewStarted,
  publishTranslatedAudio,
  authToken,
}) => {
  const SERVER_URL = `wss://external-api.kudoway.com/api/v1/translate?id=${resourceId}`;
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingQueue, setPlayingQueue] = useState([]);
  // converting the data to valid binary format
  function convertDataURIToBinary(dataURI) {
    var BASE64_MARKER = ';base64,';
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  const { getWebSocket, sendMessage } = useWebSocket(SERVER_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    onMessage: (message) => {
      let data = JSON.parse(message.data);
      console.log('Translating your audio...');
      console.log('Websocket response', data);

      var data1 = 'audio/wav;base64,' + data.audioData;
      var bufferData = convertDataURIToBinary(data1);
      var audioBlob = new Blob([bufferData], { type: 'audio/wav' });

      var reader = new FileReader();
      reader.onload = function (event) {
        var audioData = event.target.result;
        publishTranslatedAudio(audioData, data.targetLanguage, data.text);
      };
      reader.readAsArrayBuffer(audioBlob);
      if (!isInterviewStarted) {
        getWebSocket().close();
      }
    },
    onClose: (e) => {
      console.log('closed', e);
    },
    onError: (e) => console.error('Error in websocket', e),
    shouldReconnect: () => false,
    protocols: ['Authorization', authToken],
  });

  // converting audio blob to float32array and send to websocket
  const convertBlobToArray = useCallback(async () => {
    const arrayBuffer = await dataBlobUrl.arrayBuffer();

    const dataView = new DataView(arrayBuffer);
    const pcmData = new Float32Array(arrayBuffer.byteLength / 4);

    for (let i = 0; i < pcmData.length; i++) {
      pcmData[i] = dataView.getInt16(i * 4, true);
    }
    sendMessage(JSON.stringify(pcmData));
  }, [dataBlobUrl, sendMessage]);

  const publishToSubs = useCallback((message) => {
    setIsPlaying(true);
    let data = JSON.parse(message.data);
    console.log('Translating your audio...');
    console.log('Websocket response', data);

    var data1 = 'audio/wav;base64,' + data.audioData;
    var bufferData = convertDataURIToBinary(data1);
    var audioBlob = new Blob([bufferData], { type: 'audio/wav' });

    var reader = new FileReader();
    reader.onload = function (event) {
      var audioData = event.target.result;
      publish(audioData, data.targetLanguage, userTargetLanguage, data.text, setIsPlaying);
    };
    reader.readAsArrayBuffer(audioBlob);
    if (!isInterviewStarted) {
      getWebSocket().close();
    }
  });

  // render convertBlobToArray function for every chunk of data
  useEffect(() => {
    convertBlobToArray();
  }, [dataBlobUrl, convertBlobToArray]);

  useEffect(() => {
    if (!isPlaying && playingQueue.length > 0) {
      publishToSubs(playingQueue[0]);
      setPlayingQueue(playingQueue.slice(1));
    }
  }, [isPlaying]);
};
