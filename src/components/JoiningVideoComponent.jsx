import React, { useState, useEffect, useRef } from 'react';
import logo from '../assets/Group.png';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector.js';
import { useLocation } from 'react-router-dom';
import createSubscriberToken from '../ExternalApiIntegration/createSubscriberToken.js';
import { Button } from '@mui/material';
import { useVonageSession } from '../Hooks/useVonageSession.js';
import { sourceLanguages } from '../constants/sourceLanguages.js';
import { predefinedLanguages } from '../constants/PredefinedLanguages.js';
import './VideoChatComponent.scss';

export const JoiningVideoComponent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('sessionId');
  const sourceCode = searchParams.get('sourceLanguage');
  const [isWebinarStarted, setIsWebinarStarted] = useState(false);
  const [subscriberToken, setSubscriberToken] = useState(false);
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

  return (
    <>
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Vonage video Api</h1>
        </div>
      </div>
      <h4 className="AppHeading">Multilingual Webinar powered by KUDO AI</h4>
      <div className="actions-btns">
        {isWebinarStarted && subscriberToken ? (
          <div className="joinLink">
            <p className="mt-3">{sourceLanguage.name} is the default language. Adjust language here: </p>
            <LanguageSelector setSelectedLanguage={setSelectedLanguage} predefinedLanguages={predefinedLanguages} />
          </div>
        ) : null}
        {!isWebinarStarted && subscriberToken ? (
          <Button onClick={handleStartPublishing} disabled={isWebinarStarted} color="primary" variant="contained">
            Join Webinar
          </Button>
        ) : null}
      </div>
      <div className="video-container">
        <>
          <div id="subscriber" className="main-video"></div>
        </>
      </div>
    </>
  );
};
