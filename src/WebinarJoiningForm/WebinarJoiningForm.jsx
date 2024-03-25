import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WebinarJoiningForm.scss";
import Select from "react-select";
import { sourceLanguages } from "../constants/sourceLanguages.js";
import { predefinedLanguages } from "../constants/PredefinedLanguages.js";
import {
  TERMS_CONDITIONS_LINK,
  COOKIE_POLICY_LINK,
  PRIVACY_POLICY_LINK,
} from "../constants/ExternalLinks.js";
import logo from "../assets/kudo.png";
import { createVonageApiTokens } from "../ExternalApiIntegration/createVonageApiTokens.js";

export const WebinarJoiningForm = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState("female");

  const [form, setForm] = useState({
    name: "",
    target: predefinedLanguages,
    source: "",
    role: "",
    gender: selectedGender,
  });

  const sourcelanguageOptions = sourceLanguages.map((language) => ({
    value: language.code,
    label: language.name,
  }));

  const submitButton = (e) => {
    e.preventDefault();
    createVonageApiTokens()
      .then((tokens) => {
        navigate("/webinar", {
          state: {
            form: { ...form, gender: selectedGender },
            apiToken: tokens,
          },
        });
      })
      .catch((error) =>
        console.error("Error creating translation resource:", error)
      );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedOption, field) => {
    setForm({ ...form, [field]: selectedOption.value });
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  return (
    <div className="h-screen p-16">
      <div className="h-full flex flex-row items-center justify-center bg-dark-200 rounded-3xl">
        <div className="w-1/2 h-full flex items-center justify-center bg-black rounded-tl-3xl p-4 rounded-bl-3xl">
          <div className="flex items-center justify-center h-32 w-48">
            <img src={logo} alt="logo" />
          </div>
        </div>
        <div className="w-1/2 h-full flex flex-col items-center justify-center rounded-tr-3xl rounded-br-3xl p-4 bg-[#F5F5F5]">
          <div className="flex flex-col items-center my-auto justify-center gap-16">
            <h1 className="text-TextBlue text-center font-roboto font-bold text-3xl">
              Welcome!
            </h1>
            <div className="flex flex-col gap-4">
              <input
                className="w-80 rounded-lg border-1 border-[#747474] bg-[#F5F5F5] p-[0.35rem] pl-2"
                type="text"
                placeholder="Your Name"
                name="name"
                onChange={handleChange}
              ></input>
              <Select
                className="w-80"
                placeholder="Select Speaking Language"
                options={sourcelanguageOptions}
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    borderColor: "#747474",
                    backgroundColor: "#F5F5F5",
                    borderRadius: "0.5rem",
                  }),
                }}
                onChange={(selectedOption) =>
                  handleRoleChange(selectedOption, "source")
                }
              />
              <div className="flex flex-col flex-col-2 justify-content items-center">
                <p className="text-black mb-2">Select your Voice Preference</p>
                <div className="flex gap-2">
                  <input
                    className="GenderSelection"
                    type="radio"
                    inline
                    id="female"
                    label="Female"
                    value="female"
                    checked={selectedGender === "female"}
                    onChange={handleGenderChange}
                  />
                  <label for="html">Female</label>
                  <input
                    type="radio"
                    id="male"
                    inline
                    label="Male"
                    value="male"
                    checked={selectedGender === "male"}
                    onChange={handleGenderChange}
                  />
                  <label for="html">Male</label>
                </div>
              </div>
              <button
                className="text-black p-[0.35rem] w-[20.9375rem] rounded rounded-md border-none bg-[#F8C73E] hover:bg-[#F8C73E]"
                value="submit"
                type="submit"
                onClick={submitButton}
              >
                Join webinar
              </button>
            </div>
          </div>
          <div className="relative">
            <span className="text-black text-center font-roboto text-sm font-normal">
              By clicking "Join" you agree to the KUDO
            </span>
            <span className="text-blue-600 font-roboto text-sm font-normal no-underline">
              <a href={TERMS_CONDITIONS_LINK} target="_blank" rel="noreferrer">
                {"\u00A0"}Terms of Use,{"\u00A0"}
              </a>
              <a href={COOKIE_POLICY_LINK} target="_blank" rel="noreferrer">
                Cookie Policy
              </a>
              {` and `}
              <a href={PRIVACY_POLICY_LINK} target="_blank" rel="noreferrer">
                Privacy Policy.
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
