import { addCaptionsForSubscriber } from '../VonageIntegration/AddCaptionsForSubscriber.js';
import { handleError } from './HandleError.js';

export const captionSignalEvent = (event, captionLanguage, hostName) => {
  const captionData = JSON.parse(event.data);
  if (captionData.websocketTargetLanguage === captionLanguage) {
    addCaptionsForSubscriber(captionData.captionText, hostName);
  }
  console.log('Received caption:', captionData);
};

export const streamCreatedEvent = (event, setStreams, selectedTargetLanguage, setSubscriber, session) => {
  const subscriberOptions = {
    insertMode: 'append',
    width: '100%',
    height: '100%',
  };
  setStreams((prevStreams) => [...prevStreams, event.stream]);

  if (selectedTargetLanguage === event.stream.name) {
    setSubscriber(session.subscribe(event.stream, 'subscriber', subscriberOptions, handleError));
    console.log('subscriber', event);
  }
};
