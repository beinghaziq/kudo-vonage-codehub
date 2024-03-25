import OT from "@opentok/client";
import { API_KEY } from "../config.js";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import { predefinedLanguages } from "../constants/PredefinedLanguages.js";
let apiKey = API_KEY;
let session, subscriber, panner;
let publisher = [];
let captionsRemovalTimer;
let selectedTargetLanguage;
const predefinedTargetLanguge = predefinedLanguages.map(language => language.value);

function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

export function initializeSession(
  opentokApiToken,
  setChunk,
  recorderRef,
  isHost,
  SelectedLanguage,
  streams,
  setStreams,
  setIsSessionConnected
) {
  let token = isHost ? opentokApiToken.publisher_token : opentokApiToken.subscriber_token;

  selectedTargetLanguage = SelectedLanguage;

  if (session && session.isConnected()) {
    session.disconnect();
  }

  if (!session) {
    session = OT.initSession(apiKey, opentokApiToken.session_id);
  }

  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, publish to the session
    setIsSessionConnected(true);
    if (error) {
      handleError(error);
    } else {
    }
  });

  if (isHost) {
    OT.getUserMedia({ audio: true })
      .then(function (stream) {
        recorderRef.current = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/wav",
          recorderType: StereoAudioRecorder,
          timeSlice: 1000,
          ondataavailable: function (data) {
            setChunk(data);
          },
        });
        recorderRef.current.startRecording();
      })
      .catch(function (error) {
        console.error("Error accessing microphone:", error);
      });
  }

  // Subscribing to stream
  session.on("streamCreated", function (event) {
    const subscriberOptions = {
      insertMode: "append",
      width: "100%",
      height: "100%",
    };
    setStreams(prevStreams => [...prevStreams, event.stream]);
    if (SelectedLanguage === event.stream.name) {
      subscriber = session.subscribe(
        event.stream,
        "subscriber",
        subscriberOptions,
        handleError
      );
      console.log("subscriber", event);
    }
  });

  session.on('signal:caption', function(event) {
    if(event.data.websocketTargetLanguage === selectedTargetLanguage){
      addCaptionsForSubscriber(event.data.captionText);
    }
    console.log('Received caption:', event.data);
  });

  // Do some action on destroying the stream
  session.on("sessionDisconnected", function (event) {
    console.log("event in destroyed", event);
  });
}

export function stopStreaming() {
  if (session) {
    publisher.forEach(pub => {
      session.unpublish(pub); 
    });
  }
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
export function toggleAudioSubscribtion(state) {
  subscriber.subscribeToAudio(state);
}
export function toggleVideoSubscribtion(state) {
  subscriber.subscribeToVideo(state);
}

export function togglePublisherDestroy() {
  publisher.forEach(pub => {
    pub.disconnect();
  });
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

export function reSubscribeStreams(streams, userTargetLanguage) {
  if(subscriber){
    session.unsubscribe(subscriber);
  }
  console.log("Session unsubscribed");
  selectedTargetLanguage = userTargetLanguage;

  for (let i = 0; i < streams.length; i++) {
    if(streams[i].name === userTargetLanguage){
      console.log("Session resubscribed with language", streams[i].name);
      subscriber = session.subscribe(
        streams[i],
        "subscriber",
        {
          insertMode: "append",
          width: "100%",
          height: "100%",
        },
        handleError
      );
    }

  }
}

export function addCaptionsForSubscriber(CaptionText){
  const subscriberContainer = OT.subscribers.find().element;
      const [subscriberWidget] = subscriberContainer.getElementsByClassName(
        'OT_widget-container'
      );
      const captionBox = document.createElement('div');
      captionBox.classList.add('caption-box');
      captionBox.textContent = CaptionText;
      subscriberWidget.appendChild(captionBox);

      // remove the captions after 5 seconds
      const removalTimerDuration = 5 * 1000;
      clearTimeout(captionsRemovalTimer);
      captionsRemovalTimer = setTimeout(() => {
        const oldCaptionBox = subscriberWidget.querySelector('.caption-box');
        if (oldCaptionBox) oldCaptionBox.remove();
      }, removalTimerDuration);
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

export function publish(translatedBuffer, websocketTargetLanguage, userTargetLanguage, CaptionText, setIsPlaying) {
  console.log(setIsPlaying);
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Create audio stream from mp3 file and video stream from webcam
  Promise.all([
    translatedBuffer ? getAudioBuffer(translatedBuffer, audioContext) : null,
    OT.getUserMedia({ videoSource: null }),
  ])
    .then((results) => {
      const [audioBuffer] = results;
      const { audioStream, stop } = createAudioStream(
        audioBuffer,
        audioContext
      );

      for (let i = 0; i < predefinedTargetLanguge.length; i++) {
        if (!publisher[i]) {
          const publisherOptions = {
            insertMode: "append",
            width: "100%",
            height: "100%",
            // Pass in the generated audio track as our custom audioSource
            audioSource: audioStream ? audioStream.getAudioTracks()[0] : null,
            // Enable stereo audio
            enableStereo: true,
            // Increasing audio bitrate is recommended for stereo music
            audioBitrate: 128000,
            name: predefinedTargetLanguge[i],
          };

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
        } else {
          console.log("Publishing the audio....");
          // If publisher1 is already initialized, update the audio source
          if (websocketTargetLanguage === predefinedTargetLanguge[i]) {
            sendCaption(session, CaptionText, userTargetLanguage, websocketTargetLanguage);
            publisher[i].publishAudio(false); // Stop publishing audio temporarily
            publisher[i].setAudioSource(audioStream.getAudioTracks()[0]); // Set new audio source
            publisher[i].publishAudio(true); // Start publishing audio again
            publisher[i].publishCaptions(true);
          }
        }
      }
    })
    .catch((error) => {
      audioContext.close();
      throw error;
    }).finally(()=> {
      if (setIsPlaying) setIsPlaying(false);
    });
}
