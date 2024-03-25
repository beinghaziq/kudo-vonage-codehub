import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/Group.png";
import {
  initializeSession,
  reSubscribeStreams,
} from "../ExternalApiIntegration/VideoApiIntegration.js";
import { LanguageSelector } from "../LanguageSelector/LanguageSelector.js";
import { useLocation } from "react-router-dom";
import createSubscriberToken from './ExternalApiIntegration/createSubscriberToken.js';
import { Button } from "@mui/material";
import "./VideoChatComponent.scss";

export const JoiningVideoComponent = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("sessionId");
  const [isWebinarStarted, setIsWebinarStarted] = useState(false);
  const [isSessionConnected, setIsSessionConnected] = useState(false);
  const [subscriberToken, setSubscriberToken] = useState(false);
  const [SelectedLanguage, setSelectedLanguage] = useState({
    value: "ENG",
    label: "ENGLISH",
  });
  const [streams, setStreams] = useState([]);
  const [chunk, setChunk] = useState(null);
  const [opentokApiToken, setOpentokApiToken] = useState({
    session_id: sessionId,
    subscriber_token: subscriberToken,
  });
  const languageRef = useRef(false);
  const recorderRef = useRef(null);
  const isHost = false;
  useEffect(() => {
    if (isWebinarStarted) {
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
    }
  }, [isWebinarStarted]);

  useEffect(() => {
    createSubscriberToken(sessionId)
        .then((token) => {
          setSubscriberToken(token.subscriber_token);
          setOpentokApiToken({...opentokApiToken, subscriber_token: token.subscriber_token})
        })
        .catch((error) =>
          console.error("Error creating subscriber id:", error)
        );
  }, []);

  useEffect(() => {
    if (languageRef.current) {
      reSubscribeStreams(streams, SelectedLanguage.value);
    } else {
      languageRef.current = true;
    }
  }, [SelectedLanguage]);

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
            <p className="mt-3">
              English is the default language. Adjust language here:{" "}
            </p>
            <LanguageSelector setSelectedLanguage={setSelectedLanguage} />
          </div>
        ) : null }
        { !isWebinarStarted && subscriberToken ? (
          <Button
          onClick={() => setIsWebinarStarted(true)}
          disabled={isWebinarStarted}
          color="primary"
          variant="contained"
        >
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
