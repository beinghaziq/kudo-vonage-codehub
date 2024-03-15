import React, { useState, useEffect, useRef } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import { Tooltip, Button } from "@mui/material";
import logo from "./Group.png";
import {
  toggleAudio,
  toggleVideo,
  toggleAudioSubscribtion,
  toggleVideoSubscribtion,
  togglePublisherDestroy,
  initializeSession,
  stopStreaming,
  publish,
  reSubscribeStreams,
} from "./ExternalApiIntegration/VideoApiIntegration";
import { WebsocketConnection } from "./ExternalApiIntegration/websocketConnection";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import createVonageApiTokens from "./ExternalApiIntegration/createVonageApiTokens";
import CreateTranslationResource from "./ExternalApiIntegration/createTranslationResource";
import "./VideoChatComponent.scss";
import "react-toastify/dist/ReactToastify.css";

export const VideoComponent = () => {
  const location = useLocation();
  const state = location.state.form;
  const predefinedTargetLanguge = state.target.map((x) => x.value);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isStreamSubscribed, setIsStreamSubscribed] = useState(false);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const [translatedBuffer, setTranslatedBuffer] = useState(null);
  const [SelectedLanguage, setSelectedLanguage] = useState({
    value: "HIN",
    label: "HINDI",
  });
  const [streams, setStreams] = useState([]);
  const [chunk, setChunk] = useState(null);
  const [opentokApiToken, setOpentokApiToken] = useState(null);
  const [resourceId, setResourceId] = useState(null);
  const languageRef = useRef(false);
  const recorderRef = useRef(null);
  const JoiningLink = opentokApiToken
    ? `https://kudo-vonage-codehub.vercel.app/webinar/guest/?sessionId=${opentokApiToken.session_id}&SubToken=${opentokApiToken.subscriber_token}`
    : null;

  const isHost = state.role === "Host";
  useEffect(() => {
    if (isInterviewStarted) {
      initializeSession(
        opentokApiToken,
        setChunk,
        recorderRef,
        isHost,
        SelectedLanguage.value,
        streams,
        setStreams,
        setIsSessionConnected
      );
    } else {
      stopStreaming();

      if (recorderRef.current) {
        recorderRef.current.stopRecording();
      }
    }
  }, [isInterviewStarted]);

  useEffect(() => {
    if (languageRef.current) {
      reSubscribeStreams(streams, SelectedLanguage.value);
    } else {
      languageRef.current = true;
    }
  }, [SelectedLanguage]);

  useEffect(() => {
    if (isHost) {
      CreateTranslationResource(predefinedTargetLanguge, state.source)
        .then((id) => setResourceId(id))
        .catch((error) =>
          console.error("Error creating translation resource:", error)
        );

      createVonageApiTokens()
        .then((tokens) => setOpentokApiToken(tokens))
        .catch((error) =>
          console.error("Error creating translation resource:", error)
        );
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(JoiningLink);
    toast.success("Copied to Clipboard");
  };

  const onToggleAudio = (action) => {
    setIsAudioEnabled(action);
    toggleAudio(action);
  };
  const handleStartPublishing = () => {
    publish(translatedBuffer);
    setIsStreamSubscribed(true);
  };

  const onToggleVideo = (action) => {
    setIsVideoEnabled(action);
    toggleVideo(action);
  };

  const onTogglePublisherDestroy = (action) => {
    setIsInterviewStarted(action);
    togglePublisherDestroy();
  };


  const renderToolbar = () => {
    return (
      <>
        {isInterviewStarted && (
          <div className="video-toolbar">
            {isHost && isSessionConnected ? (
              <div className="video-tools">
                {isAudioEnabled ? (
                  <Tooltip title="mic on">
                    <MicIcon
                      onClick={() => onToggleAudio(false)}
                      className="on-icon"
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="mic off">
                    <MicOffIcon
                      onClick={() => onToggleAudio(true)}
                      className="off-icon"
                    />
                  </Tooltip>
                )}
                {isVideoEnabled ? (
                  <Tooltip title="camera on">
                    <VideocamIcon
                      onClick={() => onToggleVideo(false)}
                      className="on-icon"
                    />
                  </Tooltip>
                ) : (
                  <Tooltip title="camera off">
                    <VideocamOffIcon
                      onClick={() => onToggleVideo(true)}
                      className="off-icon"
                    />
                  </Tooltip>
                )}
              </div>
            ) : null}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Vonage video Api</h1>
        </div>
      </div>
      <div className="actions-btns">
        {isHost && isInterviewStarted && isSessionConnected ? (
          <Button
            onClick={handleStartPublishing}
            color="primary"
            variant="contained"
          >
            Start Publishing
          </Button>
        ) : null}
        <Button
          onClick={() => setIsInterviewStarted(true)}
          disabled={isInterviewStarted}
          color="primary"
          variant="contained"
        >
          Start Webinar
        </Button>
        {isHost ? (
          <Button
            onClick={() => onTogglePublisherDestroy(false)}
            disabled={!isInterviewStarted}
            color="secondary"
            variant="contained"
          >
            End Webinar
          </Button>
        ) : null}
      </div>
      {opentokApiToken && isInterviewStarted && isSessionConnected ? (
        <>
          <div className="joinLink">
            <p>Users can join the webinar using this link: </p>
            <button className="copyButton" onClick={handleCopyLink}>
              Copy Joining Link
            </button>
            <ToastContainer />
          </div>
        </>
      ) : null}
      <div className="video-container">
        <div
          id="publisher"
          className="main-video"
        >
          {isStreamSubscribed && renderToolbar()}
        </div>
      </div>

      {chunk && resourceId ? (
        <WebsocketConnection
          dataBlobUrl={chunk}
          translatedBuffer={translatedBuffer}
          setTranslatedBuffer={setTranslatedBuffer}
          isInterviewStarted={isInterviewStarted}
          resourceId={resourceId}
          userTargetLanguage={SelectedLanguage.value}
        />
      ) : null}
    </>
  );
};
