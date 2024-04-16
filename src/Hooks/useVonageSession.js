import { useEffect, useState } from 'react';
import OT from '@opentok/client';
import { handleError } from '../Helpers/HandleError.js';
import { captionSignalEvent, streamCreatedEvent } from '../Helpers/SessionEventCallbacks.js';

import { API_KEY } from '../config.js';

export const useVonageSession = (
  subscriberId,
  token,
  setIsSessionConnected,
  selectedTargetLanguage = 'ENG',
  hostName,
  captionLanguage,
  setIsStreamConnected
) => {
  const [session, setSession] = useState();
  const [subscriber, setSubscriber] = useState();
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    if (setIsStreamConnected) {
      setIsStreamConnected(!(streams.length === 0));
    }
  }, [streams]);

  useEffect(() => {
    if (session) {
      const onCaptionSignal = (event) => {
        console.log('CAPTION SIGNAL EVENT:');
        if (hostName) {
          captionSignalEvent(event, captionLanguage, hostName);
        }
      };
      session.on('signal:caption', onCaptionSignal);

      return () => {
        session.off('signal:caption', onCaptionSignal);
      };
    }
  }, [captionLanguage, session]);

  const subscribeSession = (session) => {
    // Connect to the session
    session.connect(token, function (error) {
      // If the connection is successful, publish to the session
      if (setIsSessionConnected) {
        setIsSessionConnected(true);
      }
      if (error) {
        handleError(error);
      }
    });

    session.on('streamCreated', (event) => {
      console.log('STREAM CREATED EVENT:');
      streamCreatedEvent(event, setStreams, selectedTargetLanguage, setSubscriber, session);
    });
  };

  const toggleSession = () => {
    console.log('Connecting to session....');
    if (session && session.isConnected()) {
      session.disconnect();
      setSession(null);
    } else {
      const initSession = OT.initSession(API_KEY, subscriberId);
      setSession(initSession);
      subscribeSession(initSession);
    }
  };

  const reSubscribeStream = (selectedLanguage) => {
    const subscriberOptions = {
      insertMode: 'append',
      width: '100%',
      height: '100%',
    };
    if (subscriber) {
      session.unsubscribe(subscriber);
    }
    console.log('Session unsubscribed');

    for (let i = 0; i < streams.length; i++) {
      if (streams[i].name === selectedLanguage) {
        console.log('Session resubscribed with language', selectedLanguage);
        const subscriber = session.subscribe(streams[i], 'subscriber', subscriberOptions, handleError);
        setSubscriber(subscriber);
      }
    }
  };

  return {
    session,
    toggleSession,
    reSubscribeStream,
  };
};
