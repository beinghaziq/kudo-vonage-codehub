import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Label, Radio } from 'flowbite-react';
import { sourceLanguages } from '../constants/sourceLanguages.js';
import { predefinedLanguages } from '../constants/PredefinedLanguages.js';
import { TERMS_CONDITIONS_LINK, COOKIE_POLICY_LINK, PRIVACY_POLICY_LINK } from '../constants/ExternalLinks.js';
import logo from '../assets/kudo.png';
import { createVonageApiTokens } from '../ExternalApiIntegration/createVonageApiTokens.js';

export const WebinarJoiningForm = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState('female');
  const [isClicked, setIsClicked] = useState(false);

  const [webinarFormData, setWebinarFormData] = useState({
    name: '',
    target: predefinedLanguages,
    source: '',
    role: '',
    gender: selectedGender,
  });

  const bgColor = !!(webinarFormData.name && webinarFormData.source) ? '#F8C73E' : '#C8E2F3';
  const sourceLanguageList = sourceLanguages.map((language) => ({
    value: language.code,
    label: language.name,
  }));

  const submitButton = (e) => {
    setIsClicked(true);
    if (!predefinedLanguages.find((lang) => lang.value === webinarFormData.source.value)) {
      predefinedLanguages.push(webinarFormData.source);
    }

    e.preventDefault();
    createVonageApiTokens()
      .then((tokens) => {
        navigate('/webinar', {
          state: {
            webinarFormData: { ...webinarFormData, gender: selectedGender, target: predefinedLanguages },
            apiToken: tokens,
          },
        });
      })
      .catch((error) => console.error('Error creating translation resource:', error));
  };

  const handleChange = (e) => {
    setWebinarFormData({ ...webinarFormData, [e.target.name]: e.target.value });
  };

  const handleSourceChange = (selectedOption) => {
    setWebinarFormData({ ...webinarFormData, source: selectedOption });
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  return (
    <div className="h-screen p-16">
      <div className="h-full p-8 rounded-3xl bg-[#F5F5F5]">
        <div className="h-full flex flex-row items-center justify-center bg-dark-200 rounded-3xl">
          <div className="w-1/2 h-full flex items-center justify-center bg-black rounded-tl-3xl p-4 rounded-bl-3xl">
            <div className="flex items-center justify-center h-32 w-48">
              <img src={logo} alt="logo" />
            </div>
          </div>
          <div className="w-1/2 h-full flex flex-col items-center justify-center rounded-tr-3xl rounded-br-3xl p-2 bg-[#F5F5F5]">
            <div className="flex flex-col items-center my-auto justify-center gap-24">
              <h1 className="text-TextBlue text-center font-roboto font-bold text-3xl">Welcome!</h1>
              <div className="flex flex-col gap-8">
                <input
                  className="w-80 h-11 rounded-lg border-2 focus:border-[#075985] hover:border-[#075985] border-[#747474] bg-[#F5F5F5] p-[0.35rem] pl-2"
                  type="text"
                  placeholder="Your Name"
                  name="name"
                  onChange={handleChange}
                ></input>
                <Select
                  className="w-80"
                  placeholder="Select Speaking Language"
                  options={sourceLanguageList}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      border: '2px solid #747474',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '0.5rem',
                      height: '44px',
                      boxShadow: 'none',
                      ':hover': {
                        border: '2px solid #075985',
                        boxShadow: 'none',
                      },
                    }),
                  }}
                  onChange={(selectedOption) => handleSourceChange(selectedOption)}
                />
                <div className="flex flex-col flex-col-2 justify-content items-center">
                  <p className="text-black mb-2">Select your Voice Preference</p>
                  <div className="flex gap-2 justify-content items-center">
                    <Radio
                      className="focus:ring-[#075985] text-[#075985]"
                      id="female"
                      label="Female"
                      value="female"
                      checked={selectedGender === 'female'}
                      onChange={handleGenderChange}
                    />
                    <Label htmlFor="html">Female</Label>
                    <Radio
                      className="focus:ring-[#075985] text-[#075985]"
                      id="male"
                      label="Male"
                      value="male"
                      checked={selectedGender === 'male'}
                      onChange={handleGenderChange}
                    />
                    <Label htmlFor="html">Male</Label>
                  </div>
                </div>
                <button
                  className="text-black p-[0.5rem] w-[20.9375rem] rounded rounded-md border-none"
                  style={{ backgroundColor: bgColor }}
                  value="submit"
                  type="submit"
                  disabled={isClicked}
                  onClick={submitButton}
                >
                  Start webinar
                </button>
              </div>
            </div>
            <div className="relative">
              <span className="text-black text-center font-roboto text-sm font-normal">
                By clicking &quot;Join&quot; you agree to the KUDO
              </span>
              <span className="text-blue-600 font-roboto text-sm font-normal no-underline">
                <a href={TERMS_CONDITIONS_LINK} target="_blank" rel="noreferrer">
                  {'\u00A0'}Terms of Use,{'\u00A0'}
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
    </div>
  );
};
