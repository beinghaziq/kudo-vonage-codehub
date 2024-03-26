import React, { useState, useEffect, useRef } from 'react';
import MicIcon from '@mui/icons-material/Mic.js';
import MicOffIcon from '@mui/icons-material/MicOff.js';
import VideocamIcon from '@mui/icons-material/Videocam.js';
import VideocamOffIcon from '@mui/icons-material/VideocamOff.js';
import { Tooltip, Button } from '@mui/material';
import OT from '@opentok/client';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import logo from '../assets/Group.png';
import { WebsocketConnection } from '../ExternalApiIntegration/websocketConnection.jsx';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import CreateTranslationResource from '../ExternalApiIntegration/createTranslationResource.js';
import { useVonageSession } from '../Hooks/useVonageSession.js';
import { useVonagePublisher } from '../Hooks/useVonagePublisher';
import './VideoChatComponent.scss';
import 'react-toastify/dist/ReactToastify.css';

export const VideoComponent = () => {
  const location = useLocation();
  const state = location.state.form;
  const opentokApiToken = location.state.apiToken;
  const predefinedTargetLanguge = state.target.map((x) => x.value);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isStreamSubscribed, setIsStreamSubscribed] = useState(false);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const [translatedBuffer, setTranslatedBuffer] = useState(null);
  const [SelectedLanguage, setSelectedLanguage] = useState({
    value: 'ENG',
    label: 'ENGLISH',
  });
  const { session, toggleSession } = useVonageSession(
    opentokApiToken?.session_id,
    opentokApiToken?.publisher_token,
    setIsSessionConnected,
    SelectedLanguage
  );
  const { createPublisher, publishTranslatedAudio, toggleAudio, toggleVideo, togglePublisherDestroy, stopStreaming } =
    useVonagePublisher(session);
  const [chunk, setChunk] = useState(null);
  const [resourceId, setResourceId] = useState(null);
  const recorderRef = useRef(null);
  const JoiningLink = opentokApiToken
    ? `${window.location.origin}/webinar/guest/?sessionId=${opentokApiToken.session_id}`
    : null;

  useEffect(() => {
    CreateTranslationResource(predefinedTargetLanguge, state.source, state.gender)
      .then((id) => setResourceId(id))
      .catch((error) => console.error('Error creating translation resource:', error));
  }, []);

  useEffect(() => {
    if (isStreamSubscribed) {
      OT.getUserMedia({ audio: true })
        .then(function (stream) {
          recorderRef.current = new RecordRTC(stream, {
            type: 'audio',
            mimeType: 'audio/wav',
            recorderType: StereoAudioRecorder,
            timeSlice: 500,
            ondataavailable: function (data) {
              setChunk(data);
            },
          });
          recorderRef.current.startRecording();
        })
        .catch(function (error) {
          console.error('Error accessing microphone:', error);
        });
    }
  }, [isStreamSubscribed]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(JoiningLink);
    toast.success('Copied to Clipboard');
  };

  const onToggleAudio = (action) => {
    setIsAudioEnabled(action);
    toggleAudio(action);
  };
  const handleStartPublishing = () => {
    setIsStreamSubscribed(true);
    createPublisher();
  };

  const handleStartWebinar = () => {
    toggleSession();
    setIsInterviewStarted(true);
  };

  const onToggleVideo = (action) => {
    setIsVideoEnabled(action);
    toggleVideo(action);
  };

  const onTogglePublisherDestroy = (action) => {
    stopStreaming();
    if (recorderRef.current) {
      recorderRef.current.stopRecording();
    }
    setIsInterviewStarted(action);
    togglePublisherDestroy();
  };

  const renderToolbar = () => {
    return (
      <>
        {isInterviewStarted && (
          <div className="video-toolbar">
            {isSessionConnected ? (
              <div className="video-tools">
                {isAudioEnabled ? (
                  <Tooltip title="mic on">
                    <MicIcon onClick={() => onToggleAudio(false)} className="on-icon" />
                  </Tooltip>
                ) : (
                  <Tooltip title="mic off">
                    <MicOffIcon onClick={() => onToggleAudio(true)} className="off-icon" />
                  </Tooltip>
                )}
                {isVideoEnabled ? (
                  <Tooltip title="camera on">
                    <VideocamIcon onClick={() => onToggleVideo(false)} className="on-icon" />
                  </Tooltip>
                ) : (
                  <Tooltip title="camera off">
                    <VideocamOffIcon onClick={() => onToggleVideo(true)} className="off-icon" />
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
    <div>
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Vonage video Api</h1>
        </div>
      </div>
      <h4 className="AppHeading">Multilingual Webinar powered by KUDO AI</h4>
      <div className="actions-btns">
        {isInterviewStarted && isSessionConnected ? (
          <Button onClick={handleStartPublishing} color="primary" variant="contained" disabled={isStreamSubscribed}>
            Start Publishing
          </Button>
        ) : null}
        {opentokApiToken ? (
          <>
            <Button onClick={handleStartWebinar} disabled={isInterviewStarted} color="primary" variant="contained">
              Start Webinar
            </Button>
            <Button
              onClick={() => onTogglePublisherDestroy(false)}
              disabled={!isInterviewStarted}
              color="secondary"
              variant="contained"
            >
              End Webinar
            </Button>
          </>
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
        <div id="publisher" className="main-video"></div>
        {isStreamSubscribed ? <div className="video-tool-bar">{renderToolbar()}</div> : null}
      </div>

      {chunk && resourceId && isStreamSubscribed ? (
        <WebsocketConnection
          dataBlobUrl={chunk}
          translatedBuffer={translatedBuffer}
          setTranslatedBuffer={setTranslatedBuffer}
          isInterviewStarted={isInterviewStarted}
          resourceId={resourceId}
          userTargetLanguage={SelectedLanguage.value}
          publishTranslatedAudio={publishTranslatedAudio}
        />
      ) : null}
    </div>
  );
};
