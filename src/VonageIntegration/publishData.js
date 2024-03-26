let panner;
export function getAudioBuffer(buffer, audioContext) {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(buffer, resolve, reject);
  });
}

export function createAudioStream(audioBuffer, audioContext) {
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
}

export function sendCaption(session, captionText, userTargetLanguage, websocketTargetLanguage) {
    session.signal({
        type: 'caption',
        data: {captionText,userTargetLanguage, websocketTargetLanguage},
      }, function(error) {
        if (error) {
          console.error('Error sending signal:', error);
        } else {
          console.log('Caption signal sent');
        }
      });
}
