import React, { useState, useEffect, useRef } from 'react';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector.js';
import { useLocation } from 'react-router-dom';
import createSubscriberToken from '../ExternalApiIntegration/createSubscriberToken.js';
import { useVonageSession } from '../Hooks/useVonageSession.js';
import { sourceLanguages } from '../constants/sourceLanguages.js';
import { predefinedLanguages } from '../constants/PredefinedLanguages.js';
import { ConfirmationModal } from './confirmationModal/ConfirmationModal.jsx';
import Avatar from 'react-avatar';
import webinar from '../assets/webinar.svg';
import logo from '../assets/black-logo.png';
import './VideoChatComponent.scss';

export const JoiningVideoComponent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('sessionId');
  const sourceCode = searchParams.get('sourceLanguage');
  const hostName = searchParams.get('name');
  const [isWebinarStarted, setIsWebinarStarted] = useState(false);
  const [subscriberToken, setSubscriberToken] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const sourceLanguage = sourceLanguages.find((language) => language.code === sourceCode);
  const languageExists = predefinedLanguages.find((lang) => lang.value === sourceCode);
  const [SelectedLanguage, setSelectedLanguage] = useState(sourceLanguage);
  const [chunk, setChunk] = useState(null);
  const languageRef = useRef(false);
  const { toggleSession, reSubscribeStreams } = useVonageSession(
    sessionId,
    subscriberToken,
    setChunk,
    SelectedLanguage.code
  );

  useEffect(() => {
    if (!languageExists) {
      predefinedLanguages.push({ value: sourceLanguage.code, label: sourceLanguage.name });
    }
  });

  useEffect(() => {
    if (languageRef.current) {
      reSubscribeStreams();
    } else {
      languageRef.current = true;
    }
  }, [SelectedLanguage]);

  useEffect(() => {
    createSubscriberToken(sessionId)
      .then((token) => {
        setSubscriberToken(token.subscriber_token);
      })
      .catch((error) => console.error('Error creating subscriber id:', error));
  }, []);

  const handleStartPublishing = () => {
    toggleSession();
    setIsWebinarStarted(true);
  };

  const onToggleSessionDestroy = () => {
    toggleSession();
    setIsWebinarStarted(false);
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-end mr-4">
        <img src={logo} className="w-[6rem] h-[1.875rem]" alt="logo" />
      </div>
      <div className="h-screen pb-24 px-16">
        <h4 className="text-[#075985] font-roboto font-bold text-xl ml-24 mb-1 leading-[1.25rem]">
          Hi {hostName}, Welcome to KUDO’s Webinar
        </h4>
        <div className="h-full p-6 flex flex-row">
          <div className="h-full w-3/4 bg-[#F5F5F5] rounded-tl-[6rem] p-4 rounded-bl-[6rem]">
            <div className="h-full flex flex-col mt-6">
              <div className="h-full flex flex-row basis-10/12">
                <div className="h-full flex flex-col gap-6 mt-3">
                  {subscriberToken ? (
                    <>
                      <button
                        className="flex flex-col items-center p-2 disabled:opacity-60"
                        onClick={handleStartPublishing}
                        disabled={isWebinarStarted}
                      >
                        <img src={webinar} alt="logo" />
                        <p className="text-[#747474] text-center font-noto-sans text-xs leading-4 font-normal">
                          Join Webinar
                        </p>
                      </button>
                    </>
                  ) : null}
                </div>
                <div className="h-10/12 w-10/12 ml-6 mt-6 bg-[#CCCCCC] flex items-center justify-center">
                  {!isWebinarStarted ? (
                    <div id="profile" className="">
                      <Avatar name={hostName} round={true} />
                    </div>
                  ) : (
                    <div id="subscriber" className="h-full w-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="h-full w-1/4 bg-[#F5F5F5] rounded-tr-[6rem] ml-4 rounded-br-[6rem]">
            <div className="h-full flex flex-row"></div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <button
            className={`flex w-[9.25rem] p-[0.5375rem] justify-center items-center gap-[0.625rem] rounded-[0.9375rem] ${openModal ? 'bg-[#075985] text-white' : 'bg-[#CCCCCC]'}`}
            onClick={() => setOpenModal(true)}
            disabled={!isWebinarStarted}
          >
            Leave
          </button>
          <ConfirmationModal
            openModal={openModal}
            setOpenModal={setOpenModal}
            onTogglePublisherDestroy={onToggleSessionDestroy}
            text={'leave'}
          />
        </div>
      </div>
    </div>
  );
};
