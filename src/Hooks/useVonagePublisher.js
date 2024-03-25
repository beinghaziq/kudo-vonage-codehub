import { useEffect, useState, useRef } from "react";
import OT from "@opentok/client";
import { predefinedLanguages } from "../constants/PredefinedLanguages.js";
import { handleError } from "../Helpers/HandleError.js";
import {
  getAudioBuffer,
  createAudioStream,
  sendCaption,
} from "../VonageIntegration/publishData.js";

export const useVonagePublisher = (session) => {
  const [publisher, setPublisher] = useState({});
  const shouldCreatePublisher = useRef(false);
  const isEmpty = Object.keys(publisher).length === 0;

  const targetLanguages = predefinedLanguages.map((language) => language.value);
  useEffect(() => {
    if (session && shouldCreatePublisher && isEmpty) {
      createPublisher(session, publisher, setPublisher);
    } 
    if(shouldCreatePublisher && !isEmpty) {
      publishTranslatedAudio();
    }else {
        shouldCreatePublisher.current = true;
    }
  }, []);

  const createPublisher = () => {
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
            session.publish(pub, (error) => {
              if (error) {
                handleError(error);
              }
            });
          }
        }
      );
      setPublisher(prev => ({
        ...prev,
        [targetLanguages[i]]: pub
      }));
      console.log("helllo", publisher, pub, targetLanguages[i])
    }  
  }

  const publishTranslatedAudio = (
    session,
    translatedBuffer,
    websocketTargetLanguage,
    userTargetLanguage,
    CaptionText
  ) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
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
        sendCaption(
          session,
          CaptionText,
          userTargetLanguage,
          websocketTargetLanguage
        );
        publisher[websocketTargetLanguage].publishAudio(false); // Stop publishing audio temporarily
        publisher[websocketTargetLanguage].setAudioSource(
          audioStream.getAudioTracks()[0]
        ); // Set new audio source
        publisher[websocketTargetLanguage].publishAudio(true); // Start publishing audio again
        publisher[websocketTargetLanguage].publishCaptions(true);
      })
      .catch((error) => {
        audioContext.close();
        throw error;
      });
  };

  return {
    publisher,
    createPublisher,
    publishTranslatedAudio
  };
};
