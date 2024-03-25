// import OT from "@opentok/client";
// import RecordRTC, { StereoAudioRecorder } from "recordrtc";
// import { handleError } from '../Helpers/HandleError.js';
// let session, subscriber;
// let publisher = [];
// let selectedTargetLanguage;

// export function initializeSession(
//   opentokApiToken,
//   setChunk,
//   recorderRef,
//   isHost,
//   SelectedLanguage,
//   streams,
//   setStreams,
//   setIsSessionConnected
// ) {
//   let token = isHost ? opentokApiToken.publisher_token : opentokApiToken.subscriber_token;

//   selectedTargetLanguage = SelectedLanguage;

//   if (isHost) {
//     OT.getUserMedia({ audio: true })
//       .then(function (stream) {
//         recorderRef.current = new RecordRTC(stream, {
//           type: "audio",
//           mimeType: "audio/wav",
//           recorderType: StereoAudioRecorder,
//           timeSlice: 500,
//           ondataavailable: function (data) {
//             setChunk(data);
//           },
//         });
//         recorderRef.current.startRecording();
//       })
//       .catch(function (error) {
//         console.error("Error accessing microphone:", error);
//       });
//   }

//   // Subscribing to stream
//   session.on("streamCreated", function (event) {
//     const subscriberOptions = {
//       insertMode: "append",
//       width: "100%",
//       height: "100%",
//     };
//     setStreams(prevStreams => [...prevStreams, event.stream]);
//     if (SelectedLanguage === event.stream.name) {
//       subscriber = session.subscribe(
//         event.stream,
//         "subscriber",
//         subscriberOptions,
//         handleError
//       );
//       console.log("subscriber", event);
//     }
//   });

//   session.on('signal:caption', function(event) {
//     if(event.data.websocketTargetLanguage === selectedTargetLanguage){
//       addCaptionsForSubscriber(event.data.captionText);
//     }
//     console.log('Received caption:', event.data);
//   });

//   // Do some action on destroying the stream
//   session.on("sessionDisconnected", function (event) {
//     console.log("event in destroyed", event);
//   });
// }

// export function reSubscribeStreams(streams, userTargetLanguage) {
//   if(subscriber){
//     session.unsubscribe(subscriber);
//   }
//   console.log("Session unsubscribed");
//   selectedTargetLanguage = userTargetLanguage;

//   for (let i = 0; i < streams.length; i++) {
//     if(streams[i].name === userTargetLanguage){
//       console.log("Session resubscribed with language", streams[i].name);
//       subscriber = session.subscribe(
//         streams[i],
//         "subscriber",
//         {
//           insertMode: "append",
//           width: "100%",
//           height: "100%",
//         },
//         handleError
//       );
//     }

//   }
// }
