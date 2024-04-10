/* eslint-disable react/prop-types */
import React from 'react';
import './LanguageSelector.scss';
import Select from 'react-select';
import Headphones from '../assets/Headphone.svg';
import Caption from '../assets/Captions.svg';

export const LanguageSelector = ({
  setCaptionLanguage,
  predefinedTargetLanguagesList,
  isCaption,
  setLanguageTooltip,
  setSelectedLanguage,
}) => {
  const handleChange = (selectedOption) => {
    isCaption ? setCaptionLanguage(selectedOption) : setSelectedLanguage(selectedOption);
  };
  const handleFocus = () => {
    !isCaption ? setLanguageTooltip(false) : null;
  };
  const CustomPlaceholder = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {isCaption ? (
        <>
          <img className="w-4 h-4" src={Caption} style={{ width: 36 }} alt="Caption" />
          <span>Captions language</span>
        </>
      ) : (
        <>
          <img className="w-4 h-4" src={Headphones} style={{ width: 36 }} alt="headphone" />
          <span>Listening language</span>
        </>
      )}
    </div>
  );
  return (
    <Select
      placeholder={<CustomPlaceholder />}
      options={predefinedTargetLanguagesList}
      onChange={handleChange}
      onFocus={handleFocus}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          width: '13.9375rem',
          height: '1.5rem',
          borderRadius: '0.75rem',
          border: '2px solid #075985',
          boxShadow: 'none',
          ':hover': {
            border: '2px solid #075985',
            boxShadow: 'none',
          },
        }),

        valueContainer: (baseStyles) => ({
          ...baseStyles,
          width: '10rem',
          padding: '2px',
        }),
      }}
    />
  );
};
