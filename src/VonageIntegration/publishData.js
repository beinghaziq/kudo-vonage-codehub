import OT from "@opentok/client";
import { handleError } from '../Helpers/HandleError.js';
import { predefinedLanguages } from "../constants/PredefinedLanguages.js";

let panner;
const targetLanguages = predefinedLanguages.map(
  (language) => language.value
);
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

export function createPublisher(session, publisher, setPublisher) {
  for (let i = 0; i < targetLanguages.length; i++) {
    const publisherOptions = {
      insertMode: "append",
      width: "100%",
      height: "100%",
      // Pass in the generated audio track as our custom audioSource
      audioSource: null,
      // Enable stereo audio
      enableStereo: true,
      // Increasing audio bitrate is recommended for stereo music
      audioBitrate: 128000,
      name: targetLanguages[i],
    };

    let pub = OT.initPublisher(
      "publisher",
      publisherOptions,
      // eslint-disable-next-line no-loop-func
      (error) => {
        if (error) {
          handleError(error);
        } else {
          // If the connection is successful, publish the publisher1 to the session
          session.publish(publisher[i], (error) => {
            if (error) {
              handleError(error);
            }
          });
        }
      }
    );
    console.log("publisher", publisher)
    setPublisher(prevPub => ({
      ...prevPub,
      [targetLanguages[i]]: pub
    }));
    console.log("helllo", publisher)
  }  
}