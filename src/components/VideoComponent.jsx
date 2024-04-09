import OT from '@opentok/client';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useVonageSession } from '../Hooks/useVonageSession.js';
import { useVonagePublisher } from '../Hooks/useVonagePublisher';
import { WebsocketConnection } from '../ExternalApiIntegration/websocketConnection.jsx';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import CreateTranslationResource from '../ExternalApiIntegration/createTranslationResource.js';
import FetchApiToken from '../ExternalApiIntegration/fetchApiToken.js';
import { ConfirmationModal } from './confirmationModal/ConfirmationModal.jsx';
import { ToastContainer, toast } from 'react-toastify';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector.jsx';
import { predefinedLanguages } from '../constants/PredefinedLanguages.js';
import Avatar from 'react-avatar';

// Import Images
import logo from '../assets/black-logo.png';
import webinar from '../assets/webinar.svg';
import copyLink from '../assets/copyLink.svg';
import mic from '../assets/Mic.svg';
import video from '../assets/Video.svg';
import videoCameraOff from '../assets/VideoCameraOff.svg';
import micOff from '../assets/Micoff.svg';
import invite from '../assets/invite.svg';
import close from '../assets/X.svg';

import 'react-toastify/dist/ReactToastify.css';

// Define Component
export const VideoComponent = () => {
  // State and Ref Declarations
  const location = useLocation();
  const state = location.state.webinarFormData;
  const opentokApiToken = location.state.apiToken;
  const predefinedTargetLanguage = state.target.map((x) => x.value);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isStreamSubscribed, setIsStreamSubscribed] = useState(false);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [captionLanguage, setCaptionLanguage] = useState(state.source);
  const [authToken, setAuthToken] = useState(null);
  const [translatedBuffer, setTranslatedBuffer] = useState(null);
  const languageExists = predefinedLanguages.find((lang) => lang.value === state.source.value);
  const { session, toggleSession } = useVonageSession(
    opentokApiToken?.session_id,
    opentokApiToken?.publisher_token,
    setIsSessionConnected
  );
  const {
    createPublisher,
    publishTranslatedAudio,
    toggleAudio,
    toggleVideo,
    togglePublisherDestroy,
    stopStreaming,
    connectMediaStreamToTokbox,
  } = useVonagePublisher(session, state.name, captionLanguage.value);
  const [chunk, setChunk] = useState(null);
  const [resourceId, setResourceId] = useState(null);
  const recorderRef = useRef(null);
  const JoiningLink = opentokApiToken
    ? `${window.location.origin}/webinar/guest/?sessionId=${opentokApiToken.session_id}&sourceLanguage=${state.source.value}&name=${state.name}`
    : null;

  // Effect Hooks
  useEffect(() => {
    if (!languageExists) {
      predefinedLanguages.push(state.source);
    }
  });

  useEffect(() => {
    document.getElementsByClassName('OT_name')[0]
      ? (document.getElementsByClassName('OT_name')[0].innerHTML = state.source.value)
      : null;
  }, [document.getElementsByClassName('OT_name')[0]]);

  useEffect(() => {
    FetchApiToken()
      .then((apiToken) => {
        setAuthToken(apiToken);
        CreateTranslationResource(predefinedTargetLanguage, state.source.value, state.gender, apiToken)
          .then((id) => setResourceId(id))
          .catch((error) => console.error('Error creating translation resource:', error));
      })
      .catch((error) => console.error('Error creating auth token:', error));
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

  useEffect(() => {
    if (isInterviewStarted && isSessionConnected) {
      handleStartPublishing();
    }
  }, [isInterviewStarted, isSessionConnected]);

  // Event Handlers
  const handleCopyLink = () => {
    navigator.clipboard.writeText(JoiningLink);
    setIsButtonClicked(false);
    toast.success('Copied to Clipboard');
  };

  const onToggleAudio = (action) => {
    setIsAudioEnabled(action);
    toggleAudio(action);
  };

  const handleStartPublishing = () => {
    createPublisher();
    setIsStreamSubscribed(true);
    setTimeout(() => {
      setShowToolbar(true);
    }, 2500);
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
    setOpenModal(false);
  };

  const renderToolbar = () => {
    return (
      <>
        {showToolbar ? (
          <div className="h-full flex items-center justify-center ml-24 basis-2/12">
            {isAudioEnabled ? (
              <button onClick={() => onToggleAudio(false)}>
                <img src={mic} alt="mic on" />
                <p className="text-[#747474] text-center font-noto-sans text-xs leading-4 font-normal">Mic</p>
              </button>
            ) : (
              <button onClick={() => onToggleAudio(true)}>
                <img src={micOff} alt="mic off" />
                <p className="text-[#747474] text-center font-noto-sans text-xs leading-4 font-normal">Mic</p>
              </button>
            )}
            {isVideoEnabled ? (
              <button className="flex flex-col justify-center items-center ml-4" onClick={() => onToggleVideo(false)}>
                <img src={video} alt="video" />
                <p className="text-[#747474] text-center font-noto-sans text-xs leading-4 font-normal">Camera</p>
              </button>
            ) : (
              <button className="flex flex-col justify-center items-center ml-4" onClick={() => onToggleVideo(true)}>
                <img src={videoCameraOff} alt="video" />
                <p className="text-[#747474] text-center font-noto-sans text-xs leading-4 font-normal">Camera</p>
              </button>
            )}
          </div>
        ) : null}
      </>
    );
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-end mr-4">
        <img src={logo} className="w-[6rem] h-[1.875rem]" alt="logo" />
      </div>
      <div className="h-screen pb-24 px-16">
        <h4 className="text-[#075985] font-roboto font-bold text-xl ml-24 mb-1 leading-[1.25rem]">
          Hi {state.name}, Welcome to KUDO’s Webinar
        </h4>
        <div className="h-full p-6 flex flex-row">
          <div className="h-full w-3/4 bg-[#EAEAEA] rounded-tl-[6rem] p-4 rounded-bl-[6rem]">
            <div className="h-full flex flex-col mt-6">
              <div className="h-full flex flex-row basis-10/12">
                <div className="h-full flex flex-col gap-6 mt-3">
                  {opentokApiToken ? (
                    <>
                      <button
                        className="flex flex-col items-center p-2 disabled:opacity-60"
                        onClick={handleStartWebinar}
                        disabled={isInterviewStarted}
                      >
                        <img src={webinar} alt="logo" />
                        <p className="text-[#747474] text-center font-noto-sans text-xs leading-4 font-normal">
                          Start Webinar
                        </p>
                      </button>
                    </>
                  ) : null}

                  <button
                    className="flex flex-col items-center p-2 disabled:opacity-60"
                    disabled={!(opentokApiToken && isInterviewStarted && isSessionConnected)}
                    onClick={() => setIsButtonClicked(true)}
                  >
                    <img src={invite} alt="logo" />
                    <p className="text-[#747474] text-center font-noto-sans text-xs leading-4 font-normal">
                      Invite Users
                    </p>
                  </button>
                  {isButtonClicked ? (
                    <>
                      <div className="w-[19.1875rem] h-[2.4375rem] rounded-[1.5625rem] border-1 border-[#747474] bg-[#C8E2F3] gap-3 flex items-center justify-end absolute top-[18rem] z-10">
                        <p className="text-[#747474] text-center font-noto-sans text-xs font-semibold overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[190px]">
                          {JoiningLink}
                        </p>
                        <div className="h-full border-r border-[#AAA9A9] w-[0.0625rem] h-[1.5rem]"></div>
                        <button onClick={handleCopyLink}>
                          <img src={copyLink} alt="copyLink" />
                        </button>
                        <button onClick={() => setIsButtonClicked(false)}>
                          <img src={close} alt="close" />
                        </button>
                        <ToastContainer />
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="h-10/12 w-10/12 ml-6 mt-6 bg-[#CCCCCC] flex items-center justify-center">
                  {!isStreamSubscribed ? (
                    <div id="profile" className="">
                      <Avatar name={state.name} round={true} />
                    </div>
                  ) : (
                    <div id="publisher" className="[&>:not(:first-child)]:hidden h-full w-full" />
                  )}
                </div>
              </div>
              {isStreamSubscribed ? renderToolbar() : null}
            </div>
          </div>
          <div className="h-full w-1/4 bg-[#EAEAEA] rounded-tr-[6rem] ml-4 rounded-br-[6rem]">
            <div className="flex justify-start items-center m-4 z-10">
              <LanguageSelector
                setCaptionLanguage={setCaptionLanguage}
                predefinedLanguages={predefinedLanguages}
                isCaption={true}
              />
            </div>
            <div id="subscriberContainer" className="h-full flex flex-col p-4 justify-start gap-10"></div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            className={`flex w-[9.25rem] p-[0.5375rem] justify-center items-center gap-[0.625rem] rounded-[0.9375rem] ${openModal ? 'bg-[#075985] text-white' : 'bg-[#CCCCCC]'}`}
            onClick={() => setOpenModal(true)}
            disabled={!isInterviewStarted}
          >
            End Webinar
          </button>
          <ConfirmationModal
            openModal={openModal}
            setOpenModal={setOpenModal}
            onTogglePublisherDestroy={onTogglePublisherDestroy}
            text={'end'}
          />
        </div>

        {chunk && resourceId && isStreamSubscribed ? (
          <WebsocketConnection
            dataBlobUrl={chunk}
            translatedBuffer={translatedBuffer}
            setTranslatedBuffer={setTranslatedBuffer}
            isInterviewStarted={isInterviewStarted}
            resourceId={resourceId}
            publishTranslatedAudio={publishTranslatedAudio}
            connectMediaStreamToTokbox={connectMediaStreamToTokbox}
            authToken={authToken}
          />
        ) : null}
      </div>
    </div>
  );
};
