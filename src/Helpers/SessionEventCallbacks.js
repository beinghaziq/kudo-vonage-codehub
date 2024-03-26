import { addCaptionsForSubscriber } from "../VonageIntegration/AddCaptionsForSubscriber.js";
import { handleError } from './HandleError.js'

export const captionSignalEvent = (event, selectedTargetLanguage) => {
  if (event.data.websocketTargetLanguage === selectedTargetLanguage) {
    addCaptionsForSubscriber(event.data.captionText);
  }
  console.log("Received caption:", event.data);
};

export const streamCreatedEvent = (event, setStreams, selectedTargetLanguage, setSubscriber, session) => {
    const subscriberOptions = {
      insertMode: "append",
      width: "100%",
      height: "100%",
    };
    setStreams(prevStreams => [...prevStreams, event.stream]);
    // setStreams(prevStream => ({
    //   ...prevStream,
    //   [event.stream.name]: event.stream
    // }));
    if (selectedTargetLanguage === event.stream.name) {
      setSubscriber(session.subscribe(
        event.stream,
        "subscriber",
        subscriberOptions,
        handleError
      ));
      console.log("subscriber", event);
    }
};

