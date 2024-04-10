import { useState } from 'react';
import OT from '@opentok/client';
import { predefinedLanguages } from '../constants/PredefinedLanguages.js';
import { handleError } from '../Helpers/HandleError.js';
import { addCaptionsForSubscriber } from '../VonageIntegration/AddCaptionsForSubscriber.js';
import { createAudioStream, sendCaption } from '../VonageIntegration/publishData.js';
import { getAudioContext } from '../constants/AudioContext.js';

export const useVonagePublisher = (session, hostName, captionLanguage) => {
  const [publishers, setPublishers] = useState({});

  const targetLanguages = predefinedLanguages.map((language) => language.value);

  const createPublisher = () => {
    const audioContext = getAudioContext();
    // Create audio stream from mp3 file and video stream from webcam
    Promise.all([OT.getUserMedia({ videoSource: null })])
      .then(() => {
        const { audioStream } = createAudioStream(null, audioContext);
        const localPublishers = {};
        for (let i = 0; i < targetLanguages.length; i++) {
          const publisherOptions = {
            insertMode: 'append',
            width: '100%',
            height: '100%',
            // Pass in the generated audio track as our custom audioSource
            audioSource: audioStream.getAudioTracks()[0],
            // Enable stereo audio
            enableStereo: true,
            // Increasing audio bitrate is recommended for stereo music
            audioBitrate: 128000,
            name: targetLanguages[i],
            timeout: 300000,
          };

          let publisher = OT.initPublisher(
            'publisher',
            publisherOptions,
            // eslint-disable-next-line no-loop-func
            (error) => {
              if (error) {
                handleError(error);
              } else {
                // If the connection is successful, publish the publisher1 to the session
                session.publish(publisher, (error) => {
                  if (error) {
                    handleError(error);
                  }
                });
              }
            }
          );
          localPublishers[targetLanguages[i]] = publisher;
        }
        setPublishers(localPublishers);
      })
      .catch((error) => {
        audioContext.close();
        throw error;
      });
  };

  const tbPublisherCallback = (langCode, mediaStreamDestination, caption) => {
    publishers[langCode].setAudioSource(mediaStreamDestination.stream.getAudioTracks()[0]);
    sendCaption(session, caption, langCode);
    if (langCode == captionLanguage) {
      addCaptionsForSubscriber(caption, hostName);
    }
  };

  // The following functions are used in functionality customization
  const toggleVideo = (state) => {
    Object.values(publishers).forEach((pub) => {
      pub.publishVideo(state);
    });
  };
  const toggleAudio = (state) => {
    Object.values(publishers).forEach((pub) => {
      pub.publishAudio(state);
    });
  };

  const togglePublisherDestroy = () => {
    Object.values(publishers).forEach((pub) => {
      pub.disconnect();
    });
  };

  const stopStreaming = () => {
    if (session) {
      Object.values(publishers).forEach((pub) => {
        session.unpublish(pub);
      });
    }
  };

  return {
    toggleVideo,
    toggleAudio,
    togglePublisherDestroy,
    stopStreaming,
    createPublisher,
    tbPublisherCallback,
  };
};
