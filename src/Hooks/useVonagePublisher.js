import { useState } from 'react';
import OT from '@opentok/client';
import { handleError } from '../Helpers/HandleError.js';
import { addCaptionsForSubscriber } from '../VonageIntegration/AddCaptionsForSubscriber.js';
import { createAudioStream, sendCaption } from '../VonageIntegration/publishData.js';
import { getAudioContext } from '../constants/AudioContext.js';
import { predefinedTargetLanguagesList } from '../constants/LanguagesList.js';

export const useVonagePublisher = (session, hostName, captionLanguage) => {
  const [publishers, setPublishers] = useState({});

  const targetLanguages = predefinedTargetLanguagesList.map((language) => language.value);

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
                publishToVonage(publisher, targetLanguages[i]);
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

  const MAX_RETRIES = 5;
  const RETRY_DELAY = 2000; // 2 seconds
  let retryCount = 0;

  const publishToVonage = (publisher, targetLanguage) => {
    session.publish(publisher, (error) => {
      if (error) {
        console.error(`Error publishing to Vonage for target language: ${targetLanguage}`, error);

        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying publication (attempt ${retryCount + 1}) for target language: ${targetLanguage}`);
          retryCount++;
          setTimeout(() => {
            publishToVonage(publisher, targetLanguage);
          }, RETRY_DELAY);
        } else {
          console.error('Maximum number of retries reached. Aborting publication.');
          // You can add additional error handling logic here, such as notifying the user
        }
      } else {
        console.log(`Successfully published to Vonage for target language: ${targetLanguage}`);
        retryCount = 0; // Reset the retry count
      }
    });
  };

  const tbPublisherCallback = (langCode, mediaStreamDestination) => {
    publishers[langCode].setAudioSource(mediaStreamDestination.stream.getAudioTracks()[0]);
  };

  const publishCaptionCallback = (langCode, caption) => {
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
    publishCaptionCallback,
  };
};
