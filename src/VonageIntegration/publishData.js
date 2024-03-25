import OT from "@opentok/client";
import { handleError } from '../Helpers/HandleError.js';
import { predefinedLanguages } from "../constants/PredefinedLanguages.js";

let panner, publisher=[];
const targetLanguages = predefinedLanguages.map(
  (language) => language.value
);

export function publish(
  session,
  translatedBuffer,
  websocketTargetLanguage,
  userTargetLanguage,
  CaptionText
) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Create audio stream from mp3 file and video stream from webcam
  Promise.all([
    translatedBuffer ? getAudioBuffer(translatedBuffer, audioContext) : null,
    OT.getUserMedia({ videoSource: null }),
  ])
    .then((results) => {
      const [audioBuffer] = results;
      const { audioStream } = createAudioStream(audioBuffer, audioContext);

          console.log("Publishing the audio....");
          // If publisher1 is already initialized, update the audio source
          if (websocketTargetLanguage === targetLanguages[websocketTargetLanguage]) {
            sendCaption(
              session,
              CaptionText,
              userTargetLanguage,
              websocketTargetLanguage
            );
            publisher[i].publishAudio(false); // Stop publishing audio temporarily
            publisher[i].setAudioSource(audioStream.getAudioTracks()[0]); // Set new audio source
            publisher[i].publishAudio(true); // Start publishing audio again
            publisher[i].publishCaptions(true);
          }
    })
    .catch((error) => {
      audioContext.close();
      throw error;
    });
}

function getAudioBuffer(buffer, audioContext) {
  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(buffer, resolve, reject);
  });
}

function createAudioStream(audioBuffer, audioContext) {
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

function sendCaption(session, captionText, userTargetLanguage, websocketTargetLanguage) {
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

// The following functions are used in functionality customization
export function toggleVideo(state) {
  publisher.forEach(pub => {
    pub.publishVideo(state);
  });
}
export function toggleAudio(state) {
  publisher.forEach(pub => {
    pub.publishAudio(state);
  });
}

export function togglePublisherDestroy() {
  publisher.forEach(pub => {
    pub.disconnect();
  });
}

export function stopStreaming() {
  // if (session) {
  //   publisher.forEach(pub => {
  //     session.unpublish(pub); 
  //   });
  // }
}

export function createPublisher(session) {
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

    console.log("helllo", publisher)

    publisher[i] = OT.initPublisher(
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
  }  
}