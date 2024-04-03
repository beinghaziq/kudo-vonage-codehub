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
  captionLanguage
) => {
  const [session, setSession] = useState();
  const [subscriber, setSubscriber] = useState();
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    if (session) {
      // Connect to the session
      session.connect(token, function (error) {
        // If the connection is successful, publish to the session
        if (setIsSessionConnected) {
          setIsSessionConnected(true);
        }
        if (error) {
          handleError(error);
        } else {
        }
      });

      session.off('signal:caption');
      if (hostName) {
        session.on('signal:caption', (event) => captionSignalEvent(event, captionLanguage, hostName));
      }
      session.on('streamCreated', (event) =>
        streamCreatedEvent(event, setStreams, selectedTargetLanguage, setSubscriber, session)
      );
    }
  }, [selectedTargetLanguage, session, setIsSessionConnected, token, captionLanguage]);

  const toggleSession = () => {
    if (session && session.isConnected()) {
      session.disconnect();
      setSession(null);
    } else {
      setSession(OT.initSession(API_KEY, subscriberId));
    }
  };

  const reSubscribeStreams = (selectedLanguage) => {
    if (subscriber) {
      session.unsubscribe(subscriber);
    }
    console.log('Session unsubscribed');

    for (let i = 0; i < streams.length; i++) {
      if (streams[i].name === selectedLanguage) {
        console.log('Session resubscribed with language', selectedLanguage);
        setSubscriber(
          session.subscribe(
            streams[i],
            'subscriber',
            {
              insertMode: 'append',
              width: '100%',
              height: '100%',
            },
            handleError
          )
        );
      }
    }
  };

  return {
    session,
    toggleSession,
    reSubscribeStreams,
  };
};
