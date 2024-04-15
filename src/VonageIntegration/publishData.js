let panner;

export const getAudioBuffer = (buffer, audioContext) => {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(buffer, resolve, reject);
  });
};

export const createAudioStream = (audioBuffer, audioContext) => {
  const startTime = audioContext.currentTime;

  const player = audioContext.createBufferSource();
  player.buffer = audioBuffer;
  player.start(startTime);

  const destination = audioContext.createMediaStreamDestination();
  panner = audioContext.createStereoPanner();
  panner.pan.value = 0;
  panner.connect(destination);
  player.connect(panner);
  return {
    audioStream: destination.stream,
    stop() {
      player.disconnect();
      player.stop();
    },
  };
};

export const sendCaption = (session, captionText, websocketTargetLanguage) => {
  session.signal(
    {
      type: 'caption',
      data: { captionText, websocketTargetLanguage },
    },
    function (error) {
      if (error) {
        console.error('Error sending signal:', error);
      } else {
        console.log('Caption signal sent');
      }
    }
  );
};
