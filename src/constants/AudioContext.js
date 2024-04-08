const audioContext = new AudioContext({ sampleRate: 16000 });

export const getAudioContext = () => {
  return audioContext;
};
