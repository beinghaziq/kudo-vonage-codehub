import { getAudioContext } from '../constants/AudioContext.js';

// converting audio blob to float32array and send to websocket
export const publishSourceAudioToWebsocket = async (sendMessageCallback) => {
  const audioContext = getAudioContext();
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
    sendMessageCallback(JSON.stringify(new Int16Array(PCM16iSamples)));
  };

  audioSrc.connect(processor);
  processor.connect(audioContext.destination);
};
